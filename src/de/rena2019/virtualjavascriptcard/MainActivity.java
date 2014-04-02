package de.rena2019.virtualjavascriptcard;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;

import android.app.ListActivity;
import android.content.SharedPreferences.Editor;
import android.content.res.Resources;
import android.os.Bundle;
import android.os.Environment;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.Toast;

/*
 * (c) by ReNa2019 http://regnerischernachmittag.wordpress.com/?vjsc
 *
 */

public class MainActivity extends ListActivity {

	private static final String PREFERENCE_FILENAME = "filename";
	ArrayAdapter<String> adapter;
	public static String filename = null;
	private String app_base_dir;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		
		try {
			Resources res = getResources();
			app_base_dir = Environment.getExternalStorageDirectory()
					.getAbsolutePath() + "/" + res.getString(R.string.app_name);
			copyRawResourceToExternalStorage(false, R.raw.hce,
					app_base_dir, "HCE.js");
			copyRawResourceToExternalStorage(false, R.raw.hce_6a82,
					app_base_dir, "HCE_6A82.js");
			copyRawResourceToExternalStorage(false, R.raw.hce_9000,
					app_base_dir, "HCE_9000.js");
			copyRawResourceToExternalStorage(false, R.raw.hce_echo,
					app_base_dir, "HCE_echo.js");
			filename = app_base_dir + "/HCE_echo.js";
			
			adapter = new ArrayAdapter<String>(this,
					android.R.layout.simple_list_item_single_choice, new ArrayList<String>() );
			setListAdapter(adapter);
			getListView().setChoiceMode(ListView.CHOICE_MODE_SINGLE);
			
			fillListview();
		} catch (Exception ex) {
			Log.e(this.getClass().getName(), ex.toString());
		}
	}

	/**
	 * Fill listview with the HCE JavaScript files from the app base directory.
	 */
	private void fillListview() {
		adapter.clear();
		File f = new File(app_base_dir);
		File file[] = f.listFiles();
		if (file != null) {
			//add all 
			for (int i = 0; i < file.length; i++) {
				adapter.add(file[i].getName());
			}
			adapter.notifyDataSetChanged();
			//select last used file
			String s = getPreferences(MODE_PRIVATE).getString(PREFERENCE_FILENAME, file[0].getName());
			int i=adapter.getPosition(s);
			if (i < 0)
				i=0;
			getListView().performItemClick(getListView(), i, getListView().getItemIdAtPosition(i));
		}
	}
	
	// http://stackoverflow.com/questions/5253837/android-copy-file-from-assets-to-sd
		/**
		 * Copy file from resource to external storage (SD card)
		 * 
		 * @param copyIfNotExisting
		 * @param resourceId
		 * @param folderName
		 * @param fileName
		 */
		private void copyRawResourceToExternalStorage(boolean forceCopy,
				int resourceId, String folderName, String fileName) {
			try {
				File folder = new File(folderName);
				if (!folder.exists())
					folder.mkdir();
				File file = new File(folder.getAbsolutePath() + "/" + fileName);
				if (forceCopy || (!forceCopy && !file.exists())) {
					InputStream is = getResources().openRawResource(resourceId);
					OutputStream os = new FileOutputStream(file);
					byte[] buffer = new byte[1024];
					int len1 = 0;
					while ((len1 = is.read(buffer)) > 0) {
						os.write(buffer, 0, len1);
					}
					is.close();
					os.close();
				}
			} catch (Exception e) {
				Log.d("copyFileToSD", e.getMessage());
			}
		}

	@Override
	protected void onListItemClick(ListView l, View v, int position, long id) {
		super.onListItemClick(l, v, position, id);
		//store the selected file name
		filename = app_base_dir + "/" + adapter.getItem(position);
		Editor editor = getPreferences(MODE_PRIVATE).edit();
		editor.putString(PREFERENCE_FILENAME, new File(filename).getName());
		editor.commit();
		Toast.makeText(this, filename, Toast.LENGTH_SHORT)
				.show();
		
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		//TODO menue getMenuInflater().inflate(R.menu.main, menu);
		return true;
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		Toast.makeText(this,
				String.valueOf(getListView().getCheckedItemCount()),
				Toast.LENGTH_LONG).show();
		return true;
	}
}
