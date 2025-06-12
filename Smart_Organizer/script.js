let courses = JSON.parse(localStorage.getItem('courses')) || [];

function renderCourses() {
  const container = document.getElementById('course-container');
  container.innerHTML = '';
  courses.forEach(course => {
    const card = document.createElement('div');
    card.className = 'course-card';
    card.onclick = () => window.location.href = `../course/course.html?course=${encodeURIComponent(course)}`;
    card.innerHTML = `<div class="course-title">${course}</div>`;
    container.appendChild(card);
  });
}

function addCourse() {
  const name = prompt("Enter course or workspace name:");
  if (name && !courses.includes(name)) {
    courses.push(name);
    localStorage.setItem('courses', JSON.stringify(courses));
    renderCourses();
  }
}

renderCourses();
