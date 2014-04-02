/* hce_echo.js */

function arraysIdentical(a, b) {
    var i = a.length;
    if (i != b.length) return false;
    while (i--) {
        if ((a[i] & 0xff) !== (b[i] & 0xff)) return false;
    }
    return true;
}

// 00 a4 04 00 07 F0 01 02 03 04 05 06
var selectEchoAID = new Array(0x00, 0xa4, 0x04, 0x00, 0x07, 0xF0, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06);
var echoSelected = false;

function processApdu(apdu) {
  var len = 0;
  var response = new Array();
  if (arraysIdentical(apdu, selectEchoAID)) {
      echoSelected = true;
      return new Array(0x90, 0x00);
  }
      if ((apdu.length & 0xff) == 4) {
          //CLA INS P1 P2
          //P2 = len
          len = (apdu[3] & 0xff);
          
          for(var index=0; index < len; index++)
              response[index] = index;
          response[len] = 0x90;
          response[len+1] = 0x00;
          return response; 
      } else {
          //CLA INS P1 P2 Lc data
          len = (apdu[4] & 0xff);
          for(var index=0; index < len; index++)
              response[index] = apdu[5 + index] & 0xff;
          //response[len] = 0x90;
          //response[len+1] = 0x00;
          return response;
      }
  return new Array(0x69, 0x00);
}
