//importPackage(java.lang);
//importClass(java.lang.System);

/* HCE_PPSE.js (c) 2014 ReNa2019 
   PPSE example script for VirtualJavaScriptCard 
 */

// /home/rena2019/workspace/VirtualJavaScriptCard/res/raw/hce_ppse.js

function parseHexString(str) { 
    var result = [];
    str = replaceAll(str, " ","");
    while (str.length >= 2) { 
        result.push(parseInt(str.substring(0, 2), 16));
        str = str.substring(2, str.length);
    }
    //System.out.println("parseHexString done");
    return result;
}

function arraysIdentical(a, b) {
    var i = a.length;
    if (i != b.length) return false;
    while (i--) {
        if ((a[i] & 0xff) !== (b[i] & 0xff)) return false;
    }
    return true;
}

function replaceAll(str, search, replacement) {
	return str.replace(new RegExp(search, 'g'), replacement);
}

function createHexString(arr) {
    var result = "";
    //System.out.println("X");
    for (i in arr) {
        var str = arr[i].toString(16);
        str = str.length == 0 ? "00" :
              str.length == 1 ? "0" + str : 
              str.length == 2 ? str :
              str.substring(str.length-2, str.length);
        result += str;
    }
    return result;
}


function asTLV(tag, value) {
   var value = replaceAll(value, " ","");
   var len = (value.length / 2 ) & 0xff;
   var hex = new Array();
   
   if (len > 127) {
      hex[0] = 0x81 & 0xff;
      hex[1] = len & 0xff;
   } else {
      hex[0] = len & 0xff;
   }
   return tag + createHexString(hex) + value;
}

var cmdSELECT = parseHexString("00a404000e325041592e5359532e444446303100");
var appletSelected = false;

function processApdu(apdu) {

  //SELECT PPSE / 32 50 41 59 2E 53 59 53 2E 44 44 46 30 31
  if (apdu.length >= 5 && apdu[0] == 0x00 && (apdu[1] & 0xff) == 0xa4 && apdu[2] == 0x04 && apdu[3] == 0x00 && apdu[4] == 0x0E)
     return parseHexString(asTLV("6F", /* 6F: File Control Information (FCI) Template */
	                                   asTLV("84", "325041592E5359532E4444463031") /* 84: Dedicated File (DF) Name '2PAY.SYS.DDF01' */
                                     + asTLV("A5", /* A5: File Control Information (FCI) Proprietary Template */
									               asTLV("BF0C",  /* BF0C: File Control Information (FCI) Issuer Discretionary Data */
									                     asTLV("61",  /* 61: Application Template */
												              asTLV("4F", "A0000000043060") /* 4F: Application Identifier (AID) card: Maestro (debit card) */
												            + asTLV("87", "01") /* 87: Application Priority Indicator */ )))
							    )
                            + "9000");
  //SELECT A0000000043060
  if (apdu.length >= 4 && apdu[0] == 0x00 && (apdu[1] & 0xff) == 0xa4 && apdu[2] == 0x04 && apdu[3] == 0x00)
     return parseHexString(asTLV ("6F", /* 6F: File Control Information (FCI) Template */
	                                    asTLV("84", "A0000000043060") /* 84: Dedicated File (DF) Name */
	                                  + asTLV("A5", /* A5: File Control Information (FCI) Proprietary Template */
									              asTLV("50", "4D41455354524F") /* 50: 50: Application Label: MAESTRO */
												+ asTLV("87", "01") /* 87: Application Priority Indicator */
												+ asTLV("5F2D", "6465") /* 5F2D: Language Preference: de */
												+ asTLV("9F11", "01") /* Issuer Code Table Index */
												+ asTLV("9F12", "4D61657374726F") /* 9F12: Application Preferred Name: Maestro */
												+ asTLV("BF0C", /* BF0C: File Control Information (FCI) Issuer Discretionary Data */
												         asTLV("9F4D", "0B0A") /* 9F4D: Log Entry */
													   )
											  ) 
								 )
	                             + "9000");
  
  /*
   GET PROCESSING OPTIONS
   => 80 A8 00 00 02 83 00 00
   <= 77 16 82 02 19 80 94 10 08 01 01 00 10 01 01 01 18 01 02 00 20 01 01 00
  */
  if (apdu.length >= 6 && (apdu[0] & 0xff) == 0x80 & (apdu[1] & 0xff) == 0xA8 && apdu[2] == 0 && apdu[3] == 0 && apdu[4] == 0x02)
     return parseHexString( asTLV("77", /* 77: Response Message Template Format 2 */
	                                    asTLV("82", "1980") /* 82: Application Interchange Profile */
	                                  + asTLV("94", "08010100100101011801020020010100") /* 94: Application File Locator (AFL) */
							     ) 
	                        + "9000");

  /*
  Sending READ RECORD command (SFI 2 Record 1)
  CLA INS P1  P2  LC  LE
  00  B2  01  14  00  00
  */
  if (apdu.length >= 5 && ((apdu[0] & 0xff) == 0x00) && ((apdu[1] & 0xff) == 0xB2) && ((apdu[2] & 0xff) == 0x01) && ((apdu[3] & 0xff) == 0x14) && ((apdu[4] & 0xff) == 0x00))
     // http://crdpro.su/archive/index.php/t-64052.html
     /*return parseHexString("70 4D 57 13 01 02 03 04 05 06 07 08 D0 70 42 01 20 00 00 96 00 00 0F 5F 20 1A 43 48 41 4E 47 20 53 41 55 20 53 48 45 4F 4E 47 20 20 20 20 20 20 20 20 20 20 9F 1F 18 32 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 39 36 30 30 30 30 30 30 9000");
     */
     return parseHexString(asTLV("70", /* 70: Application Elementary File (AEF) Template */
	                                   asTLV("57", "5413339000001513D0712201000000000000") /* Track 2 Equivalent Data */
                                     + asTLV("54", "5413339000001513")
                                     + asTLV("5F20", "746573742063617264") /* Cardholder Name ASCII */
                                     + asTLV("5F24", "151231") /* Application Expiration Date  */
                                     + asTLV("5F25", "020101") /* Application Effective Date */
                                     + asTLV("5F28", "0056") /* Issuer Country Code */
                                     + asTLV("9F4A", "82") /* SDA Tag List */
                                     + asTLV("9F07", "FF00") /* Application Usage Control */
                                     + asTLV("9F08", "0002") /* Application Version Number */
                                     + asTLV("9F0D", "F840642000") /* Issuer Action Code Default  */
                                     + asTLV("9F0E", "0010880000") /* Issuer Action Code Denial  */
                                     + asTLV("9F0F", "F86064F800") /* Issuer Action Code Online */
                                     + asTLV("9F42", "0978" ) /* Application Currency Code */
                                ) + "9000");


  /* Sending READ RECORD command (SFI 3 Record 1)
   CLA INS P1  P2  LC  LE
   00  B2  01  1C  00  00
  */
  if (apdu.length >= 5 && ((apdu[0] & 0xff) == 0x00) && ((apdu[1] & 0xff) == 0xB2) && ((apdu[2] & 0xff) == 0x01) && ((apdu[3] & 0xff) == 0x1C) && ((apdu[4] & 0xff) == 0x00))
     return parseHexString(asTLV("70", /* 70: Application Elementary File (AEF) Template */
	                                   asTLV("5A", "5413339000001513") /* 5A: Application Primary Account Number (PAN) */
	                                 + asTLV("8C", "9F02069F03069F1A0295055F2A029A039C019F37049F35019F45029F4C089F3403") /* 8C: Card Risk Management Data Object List 1 (CDOL1) */
                                     + asTLV("8D", "910A8A0295059F37049F4C08") /* 8D: Card Risk Management Data Object List 1 (CDOL2) */
                                 ) + "9000");
     
  /*
   Sending READ RECORD command (SFI 3 Record 2)
   CLA INS P1  P2  LC  LE
   00  B2  02  1C  00  00
   */
   if (apdu.length >= 5 && ((apdu[0] & 0xff) == 0x00) && ((apdu[1] & 0xff) == 0xB2) && ((apdu[2] & 0xff) == 0x02) && ((apdu[3] & 0xff) == 0x1C) && ((apdu[4] & 0xff) == 0x00))
     return parseHexString(asTLV("70", "") /* 70: Application Elementary File (AEF) Template:  DUMMY */
	                              + "9000"); /* DUMMY */ 

  /* Sending READ RECORD command (SFI 4 Record 1)
     CLA INS P1  P2  LC  LE
     00  B2  01  24  00  00
  */
  if (apdu.length >= 5 && ((apdu[0] & 0xff) == 0x00) && ((apdu[1] & 0xff) == 0xB2) && ((apdu[2] & 0xff) == 0x01) && ((apdu[3] & 0xff) == 0x24) && ((apdu[4] & 0xff) == 0x00))
     return parseHexString(asTLV("70", "") /* 70: Application Elementary File (AEF) Template:  DUMMY */
	                              + "9000"); /* DUMMY */

  /*
   GENERATE AC Processing
   80  AE  90  00  2B  00
   */
   if (apdu.length >= 5 && ((apdu[0] & 0xff) == 0x80) && ((apdu[1] & 0xff) == 0xAE) && ((apdu[2] & 0xff) == 0x90) && ((apdu[3] & 0xff) == 0x00) && ((apdu[4] & 0xFF) == 0x2B))
      // TODO: create response (ERROR: Missing or incomplete TLV data 151)
     return parseHexString(asTLV("77",   asTLV("51", "02")
                                       + asTLV("9F27", "00")  /* 9F27: Cryptogram Information Data (CID) */ 
                                       + asTLV("9736", "0000")  /* 9736: Application Transaction Counter 9F36? tag */
                                ) + "9000");

    //TODO: otherwise: first 2 apdu bytes + 0x6E00 error
   return new Array(apdu[0] & 0xff, apdu[1] & 0xff, (apdu.length & 0xff), 0x6E, 0x00);
}

