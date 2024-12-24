let useHttp3 = false; // Estado inicial: HTTP

document.getElementById("protocol-toggle-btn").addEventListener("click", (e) => {
    useHttp3 = !useHttp3;
    e.target.textContent = useHttp3 ? "HTTP/3" : "HTTP"; // Atualizar o texto do botão
    e.target.classList.toggle("active", useHttp3); // Alterna a classe "active"
});
