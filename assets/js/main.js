document.addEventListener('DOMContentLoaded', function() {
  function updateScrolledClass() {
    if (document.documentElement.scrollHeight > window.innerHeight) {
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }
  }
  updateScrolledClass();
  window.addEventListener('resize', updateScrolledClass);
});
