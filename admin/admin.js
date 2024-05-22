document.addEventListener("DOMContentLoaded", function () {
    const socket = io.connect("http://127.0.0.1:3000");
    const canvasViewer = document.getElementById("canvas-viewer");
    const canvasViewerDocument = canvasViewer.contentDocument || canvasViewer.contentWindow.document;
    const canvas = canvasViewerDocument.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    // function login() {
    //     let username = "";
    //     let password = "";

    //     while (true) {
    //         username = prompt("Enter your username:");
    //         if (username === null || username.trim() === "") {
    //             alert("Please enter a username to continue.");
    //             continue;
    //         }

    //         password = prompt("Enter your password:");
    //         if (password === null || password.trim() === "") {
    //             alert("Please enter a password to continue.");
    //             continue;
    //         }

    //         if (username === "admin" && password === "password") {
    //             break;

    //         } else {
    //             alert("Invalid username or password. Please try again.");
    //         }
    //     }
    // }

    // login();

    socket.on("loadDrawingData", (drawingData) => {
        if (ctx) {
            drawingData.forEach((data) => {
                if (data.type === "start") {
                    ctx.beginPath();
                    ctx.moveTo(data.x, data.y);
                    ctx.strokeStyle = data.color;
                    ctx.lineWidth = data.width;
                } else if (data.type === "draw") {
                    ctx.lineTo(data.x, data.y);
                    ctx.strokeStyle = data.color;
                    ctx.lineWidth = data.width;
                    ctx.stroke();
                } else if (data.type === "stop") {
                    ctx.beginPath();
                }
            });
        }
    });


    //Displays Database in admin page in table format
    fetch("/admin")
        .then((response) => response.json())
        .then((data) => {
            const tableBody = document.getElementById("data-table-body");

            data.forEach((entry) => {
                const row = document.createElement("tr");

                row.innerHTML = `
                        <td>${entry.id}</td>
                        <td>${entry.sessionID}</td>
                        <td>${entry.type}</td>
                        <td>${entry.x}</td>
                        <td>${entry.y}</td>
                        <td>${entry.color}</td>
                        <td>${entry.width}</td>
                    `;

                tableBody.appendChild(row);
            });
        })
        .catch((error) => {
            console.log(error);
        });


    //Clears Canvas of all drawings
    const clearCanvas = document.getElementById("clear-canvas");
    clearCanvas.addEventListener("click", () => {
        if (confirm('Are you sure you want to clear the canvas?')) {
            fetch("/clear", {
                method: 'DELETE'
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert('Error clearing canvas');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    });

    //Deletes all drawings for a specific session ID
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach(button => {
        button.addEventListener("click", function () {
            const sessionId = this.getAttribute("data-session-id");
            if (confirm(`Are you sure you want to delete all drawings for session ID: ${sessionId}?`)) {
                fetch(`/delete/${sessionId}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            location.reload(); // Reload the page to reflect changes
                        } else {
                            alert('Error deleting drawings');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }
        });
    });
});