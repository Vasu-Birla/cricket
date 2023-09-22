 $(document).ready(function(evt) {
  // FIXME : enable image & table resize
  document.execCommand("enableAbsolutePositionEditor", false, true)
  document.execCommand("enableInlineTableEditing", false, true)
  document.execCommand("enableObjectResizing", false, true)
  
  // TODO : enable insert table
  
  $('.btns button').click(function(evt) {
    let value = null
    if ($(this).hasClass("prompt")) {
      value = prompt('Enter the link here: ', 'http:\/\/');
    }
    execCmd($(this).data('cmd'), value)
  });

  $('.btns select').change(function(evt) {
    execCmd($(this).data('cmd'), $(this).val())
  });

  $('.btns input').change(function(evt) {
    execCmd($(this).data('cmd'), $(this).val())
  });
})



function execCmd(cmd, value) {
  document.execCommand(cmd, false, value);
}

function getStyle () {
    const colour = document.queryCommandValue("ForeColor");
    const fontSize = document.queryCommandValue("FontSize");
  
  alert(colour + ", " + fontSize)
}