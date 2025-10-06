// Array de clases ficticio
const students = [
    {
        id: "1",
        icon: "user.jpg",
        name: "Sofía",
        lastName: "Rodríguez",
    },
    {
        id: "2",
        icon: "user.jpg",
        name: "Sofía",
        lastName: "Rodríguez",
    },
    {
        id: "3",
        icon: "user.jpg",
        name: "Sofía",
        lastName: "Rodríguez",
    },
    {
        id: "4",
        icon: "user.jpg",
        name: "Sofía",
        lastName: "Rodríguez",
    },
    {
        id: "5",
        icon: "user.jpg",
        name: "Sofía",
        lastName: "Rodríguez",
    },
    {
        id: "6",
        icon: "user.jpg",
        name: "Sofía",
        lastName: "Rodríguez",
    },
    {
        id: "7",
        icon: "user.jpg",
        name: "Sofía",
        lastName: "Rodríguez",
    },
    {
        id: "8",
        icon: "user.jpg",
        name: "Sofía",
        lastName: "Rodríguez",
    },
]


renderStudents();


function renderStudents() {
    // Clonar un fragmento y rellenarlo con los datos
    const content = document.querySelector(".content");
    const template = document.getElementById("student-template");
    const fragment = document.createDocumentFragment();
    
    students.forEach((item) => {
        const clone = template.content.cloneNode(true);
        
        const boxEl = clone.querySelector(".box");
        const nameEl = clone.querySelector("#name");
        const iconEl = clone.querySelector("img");
        const lastNameEl = clone.querySelector("#lastName");
    
        boxEl.href = `/alumno/${item.id}`;
        nameEl.textContent = item.name;
        iconEl.src = `../assets/${item.icon}`;
        lastNameEl.textContent = item.lastName;
    
        fragment.appendChild(clone);
    })
    
    content.appendChild(fragment);
}


