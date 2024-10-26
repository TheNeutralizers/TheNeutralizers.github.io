function autoRefresh() {
    window.location = window.location.href;
}
setInterval('autoRefresh()', 5000);
alert("1")