async function testAPI() {
    try {
        const response = await fetch("http://localhost:3000/");
        const data = await response.text();
        console.log("Respuesta del servidor:", data);
    } catch (error) {
        console.error("Error:", error);
    }
}

testAPI();
