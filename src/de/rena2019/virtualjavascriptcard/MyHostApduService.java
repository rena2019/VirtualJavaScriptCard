package de.rena2019.virtualjavascriptcard;

import java.io.File;
import java.io.FileReader;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.NativeArray;
import org.mozilla.javascript.NativeJavaArray;
import org.mozilla.javascript.NativeJavaObject;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.UniqueTag;

import android.nfc.cardemulation.HostApduService;
import android.os.Bundle;
import android.util.Log;

/*
 * (c) by ReNa2019 http://regnerischernachmittag.wordpress.com/?vjsc
 *
 */

/*
 *  2014-03-xx started
 *  2014-03-31 code cleanup
 *  
 *  TODO: void sendResponseApdu
 */

public class MyHostApduService extends HostApduService {

	//member variables
	private Context cx;
	private Scriptable scope;
	private long lastModified;
	
	/**
	 * The one and only HCE function: processCommandApdu.
	 */
	@Override
	public byte[] processCommandApdu(byte[] apdu, Bundle extras) {

		byte[] bytes = new byte[] { (byte)0x6F, (byte)0xFF };
		try {
			//call javascript function processApdu
			Object ret = callFunction("processApdu", new Object[] { apdu });
			if (ret != null)
				bytes = ObjectToByteArray(ret);
		} catch(Exception ex) {
			Log.e(this.getClass().getName(), ex.toString());
		}
		return bytes;
	}

	// Rhino Lib
	// https://developer.mozilla.org/en-US/docs/Rhino/Scripting_Java
	// https://developer.mozilla.org/en/docs/Rhino/Embedding_tutorial
	// http://illegalargumentexception.blogspot.de/2013/01/dojo-bootstrapping-in-embedded-rhino.html
	private void init() {
		try {
			cx = Context.enter();
			//http://stackoverflow.com/questions/3859305/problems-using-rhino-on-android
			cx.setOptimizationLevel(-1);
			cx.setLanguageVersion(Context.VERSION_1_2);
			scope = cx.initStandardObjects();
			/*Object result =*/ cx.evaluateReader(scope, new FileReader(MainActivity.filename),
					new File(MainActivity.filename).getName(), 0, null);
			lastModified = new File(MainActivity.filename).lastModified();
		} catch (Exception ex) {
			Log.e(this.getClass().getName(), ex.toString());
		}
	}

	/**
	 * Call given JavaScript function (with parameters)
	 * @param functionName
	 * @param params
	 * @return
	 * @throws Exception
	 */
	private Object callFunction(String functionName, Object[] params) throws Exception {
		if (lastModified == 0
				|| (new File(MainActivity.filename)).lastModified() != lastModified) {
			// update script file / context
			init();
		}
		Object o = scope.get(functionName, scope);
		if (o != null && o != UniqueTag.NOT_FOUND) {
			Function fct = (Function) o;
			return fct.call(cx, scope, scope, params);
		}
		return null;
	}

	/*
	 * Convert the given object array to an array of bytes (if possible).
	 */
	private byte[] ObjectToByteArray(Object array) {
		byte[] b = new byte[] {(byte)0x6F, (byte)0xFC };
		try {
		if (array instanceof NativeArray) {
			NativeArray na = ((NativeArray) array);
			b = new byte[(int) na.getLength()];
			for (Object o : ((NativeArray) array).getIds()) {
				int index = (Integer) o;
				Object val = na.get(index);
				if (val instanceof Double)
					b[index] = ((Double) val).byteValue();
				else
					b[index] = (byte) ((Integer) (val) & 0xff);
			}
		} else if (array instanceof byte[]) {
			return (byte[]) array;

		} else if (array instanceof NativeJavaArray) {
			NativeJavaArray na = (NativeJavaArray) array;
			Object[] a = na.getIds();
			b = new byte[a.length];
			for (Object o : na.getIds()) {
				int index = (Integer) o;
				NativeJavaObject njo = (NativeJavaObject) na.get(index, null);
				b[index] = (byte) ((Integer) (njo.unwrap()) & 0xff);
			}
		} else {
			b = new byte[] { (byte)0x6F, (byte)0xFE };
			Log.e(this.getClass().getName(), "TODO: " + array.getClass().getCanonicalName());
		}
		}catch(Exception ex) {
			Log.e(this.getClass().getName(), "ObjectToByteArray Exception: " + ex);
			b = new byte[] { (byte)0x6F, (byte)0xFD };
		} 
		return b;
	}

	@Override
	public void onDeactivated(int reason) {
		try {
			//call javascript function onDeactivated
			callFunction("onDeactivated", new Object[] { reason });
		} catch(Exception ex) {
			Log.e(this.getClass().getName(), ex.toString());
		}
	}
}