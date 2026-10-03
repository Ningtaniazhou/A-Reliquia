// Reopening a chapter URL starts at the cover. Explicit test pages and one-use
// in-story handoffs retain their entry; live chapters inside the cover stay put.
(()=>{const p=new URLSearchParams(location.search);if(window.top===window&&!['play','preview','scene','entry','bridge'].some(k=>p.has(k)))location.replace('./covers.html');})();
