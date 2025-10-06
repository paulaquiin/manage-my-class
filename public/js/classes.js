// Array de clases ficticio
const classes = [
    {
        id: "1",
        color: "rgba(168, 85, 247, 1)",
        icon: "math.svg",
        title: "Matemáticas avanzadas",
        class: "2º ESO",
        students: 8,
    },
    {
        id: "2",
        color: "rgba(168, 85, 247, 1)",
        icon: "math.svg",
        title: "Historia del arte",
        class: "3º ESO",
        students: 12,
    },
    {
        id: "3",
        color: "rgba(168, 85, 247, 1)",
        icon: "math.svg",
        title: "Química Orgánica",
        class: "1º ESO",
        students: 10,
    },
    {
        id: "4",
        color: "rgba(168, 85, 247, 1)",
        icon: "math.svg",
        title: "Literatura",
        class: "2º Primaria",
        students: 4,
    },
    {
        id: "5",
        color: "rgba(168, 85, 247, 1)",
        icon: "math.svg",
        title: "Física Cuántica",
        class: "2º Bachillerato",
        students: 21,
    },
]


renderClasses();


function renderClasses() {
    // Clonar un fragmento y rellenarlo con los datos
    const content = document.querySelector(".content");
    const template = document.getElementById("box-template");
    const fragment = document.createDocumentFragment();
    
    classes.forEach((item) => {
        const clone = template.content.cloneNode(true);
        
        const boxEl = clone.querySelector(".box");
        const classEl = clone.querySelector("#class");
        const iconEl = clone.querySelector("img");
        const titleEl = clone.querySelector("#title");
        const studentsEl = clone.querySelector("#students");
    
        boxEl.href = `/clases/${item.id}`;
        classEl.textContent = item.class;
        iconEl.src = `../assets/${item.icon}`;
        titleEl.textContent = item.title;
        studentsEl.textContent = `${item.students} estudiantes`;
    
        fragment.appendChild(clone);
    })
    
    content.appendChild(fragment);
}
