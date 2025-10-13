import { closeDialog } from "./dialog.js";
import { handleFetch } from "./handle-fetch.js"
import { iconList } from "./utils/icons.js";

// Variables globales
const userId = localStorage.getItem("user_id");
const form = document.querySelector("form");
const wrapper = document.querySelector(".wrapper");
const studentClassSelectEl = document.getElementById("student-class-select");
const fileInput = document.getElementById("student-photo-input");

// Funciones
getStudents();
fillClasses();
handleChosenPhotoPreview();

/**
 * ALUMNOS
 */

// Recupera las clases de base de datos
async function getStudents() {
    const result = await handleFetch(
        `http://localhost:3000/api/student?userId=${userId}`,
        "GET",
    )
    if (!result.success) {
        const errorEl = document.getElementById(result.errorId);
        if (errorEl) {
            errorEl.classList.add("show");
        }
    } else {
        // Vacíar el contenido del dom
        clearDom();
        // Renderizar los estudiantes
        renderStudents(result.rows);
    }
}


// Se encarga de eliminar el contenido: clase y lista de alumnos
function clearDom() {
    wrapper.innerHTML = "";
}

function renderStudents(students) {
    // Clonar un fragmento y rellenarlo con los datos
    const studentTemplate = document.getElementById("student-template");
    const classTemplate = document.getElementById("class-template");
    const fragment = document.createDocumentFragment();


    // Agrupamos los estudiantes por su clase
    const classrooms = [];
    for (const student of students) {
        const className = student.class_name;
        const classIcon = student.icon;
        const classCourse = student.grade;
        // Iteramos por cada estudiante y comprobamos su nombre de clase
        if (className) {
            // Buscamos si hay ya un grupo con el nombre de la clase
            let group = classrooms.find(g => g.class_name === className);
            // Si no es así, creamos el grupo y lo añadimos al array
            if (!group) {
                group = { class_name: className, grade: classCourse, icon: classIcon, students: [] };
                classrooms.push(group);
            }
            // Con el grupo creado le añadimos el estudiante que toca
            group.students.push(student);
            // Esto se itera hasta que se queda sin estudiantes,
            // en el caso de que toca una clase donde ya existe
            // un grupo, entonces simplemente se añade el estudiante
            // a ese grupo
        }
    }

    classrooms.forEach((classroom) => {
        const classInfo = document.createElement("div");
        classInfo.classList.add("class-info");

        const classClone = classTemplate.content.cloneNode(true);
        const classIconEl = classClone.querySelector("#class-icon");
        const classNameEl = classClone.querySelector("#class-name");
        const classCourseEl = classClone.querySelector("#class-course");

        classIconEl.src = iconList[classroom.icon];
        classNameEl.textContent = classroom.class_name;
        classCourseEl.textContent = classroom.grade;

        classInfo.appendChild(classClone);
        fragment.appendChild(classInfo);

        const content = document.createElement("div");
        content.classList.add("content");

        classroom.students.forEach((student) => {
            const clone = studentTemplate.content.cloneNode(true);
            const nameEl = clone.querySelector("#name");
            const iconEl = clone.querySelector("img");
            const lastNameEl = clone.querySelector("#lastName");

            nameEl.textContent = student.student_name;
            iconEl.src = student.photo;
            lastNameEl.textContent = student.surname;

            content.appendChild(clone);
        })

        fragment.appendChild(content);
    })

    wrapper.appendChild(fragment);
}



form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    // Obtener nombre y curso
    const { name, surname } = Object.fromEntries(formData.entries());

    // Obtener curso
    const classId = studentClassSelectEl.value;

    // Foto
    let photo = undefined;
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file); // convierte el archivo a base64
    reader.onload = async (event) => {
        photo = event.target.result
        const result = await handleFetch(
            "http://localhost:3000/api/student",
            "POST",
            JSON.stringify({ name, surname, classId, photo, userId })
        )

        if (!result.success) {
            const errorEl = document.getElementById(result.errorId);
            if (errorEl) {
                errorEl.classList.add("show");
            }
        } else {
            closeDialog();
            getStudents();
        }
    }
})


/**
 * DIALOG
 */

// Rellena el selector del dialog con las clases
async function fillClasses() {
    const result = await handleFetch(
        `http://localhost:3000/api/class?userId=${userId}`,
        "GET",
    )
    if (result.success) {
        result.rows.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.id;
            option.text = item.name;
            studentClassSelectEl.add(option)
        })
    }
}

// Se encarga de captar el evento de foto cambiado para imprimirlo en la preview
async function handleChosenPhotoPreview() {
    fileInput.addEventListener("change", (e) => {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (event) => {
            const photoPreviewEl = fileInput.parentElement.querySelector("#student-photo");
            const parent = fileInput.parentElement.querySelector("label");
            // Para saber si el avatar es un svg o una img compruebo si el elemento tiene la propiedad src
            // si tiene src significa que es un <img>, sino, es un <svg>
            if (photoPreviewEl.hasOwnProperty("src")) {
                // Es un <img>, simplemente reemplazar el valor de src
                photoPreviewEl.src = event.target.result;
            } else {
                // Es un <svg>, debo crear un <img> y reemplazarlo.
                const img = document.createElement("img");
                img.src = event.target.result;
                photoPreviewEl.remove();
                parent.appendChild(img);

            }
        }
    })
}