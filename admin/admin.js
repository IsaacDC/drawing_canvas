document.addEventListener("DOMContentLoaded", function () {
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
        const deleteButtons = document.querySelectorAll(".delete-btn");
            deleteButtons.forEach(button => {
                button.addEventListener("click", function() {
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