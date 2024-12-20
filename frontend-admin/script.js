document.addEventListener("DOMContentLoaded", () => {
    const answersContainer = document.querySelector(".answers");
    const addAnswerButton = document.getElementById("add-answer");
    const saveQuizButton = document.getElementById("save-quiz");

    // Adicionar resposta adicional
    addAnswerButton.addEventListener("click", () => {
        const newAnswer = document.createElement("div");
        newAnswer.classList.add("answer");

        const icon = document.createElement("div");
        icon.classList.add("answer-icon");
        icon.style.backgroundColor = getRandomColor();

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Adicione resposta adicional";
        input.classList.add("answer-input");

        const toggleCorrect = document.createElement("button");
        toggleCorrect.classList.add("toggle-correct");
        toggleCorrect.textContent = "✔️";

        newAnswer.appendChild(icon);
        newAnswer.appendChild(input);
        newAnswer.appendChild(toggleCorrect);
        answersContainer.appendChild(newAnswer);
    });

    // Salvar Quiz
    saveQuizButton.addEventListener("click", () => {
        const quizName = document.getElementById("quiz-name").value;
        const questionTitle = document.getElementById("question-title").value;
        const answers = Array.from(
            document.querySelectorAll(".answer-input")
        ).map((input) => input.value);

        console.log({
            quizName,
            questionTitle,
            answers,
        });

        alert("Quiz salvo com sucesso!");
    });

    function getRandomColor() {
        const colors = ["#e74c3c", "#3498db", "#f1c40f", "#2ecc71"];
        return colors[Math.floor(Math.random() * colors.length)];
    }
});
