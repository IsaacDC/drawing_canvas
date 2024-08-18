document.addEventListener("DOMContentLoaded", function () {
  // function login() {
  //   let username = "";
  //   let password = "";

  //   while (true) {
  //     username = prompt("Enter your username:");
  //     if (username === null || username.trim() === "") {
  //       alert("Please enter a username to continue.");
  //       continue;
  //     }

  //     password = prompt("Enter your password:");
  //     if (password === null || password.trim() === "") {
  //       alert("Please enter a password to continue.");
  //       continue;
  //     }

  //     if (username === "admin" && password === "password") {
  //       break;

  //     } else {
  //       alert("Invalid username or password. Please try again.");
  //     }
  //   }
  // }

  // login();



  //loads drawings for each canvas per session
  function renderDrawings() {
    fetch("/getDrawingData")
      .then((response) => response.json())
      .then((drawingData) => {
        const sessionCanvases = document.querySelectorAll(".session-canvas");

        sessionCanvases.forEach((canvas) => {
          const sessionId = canvas.getAttribute("data-session-id");
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          function drawLine(x1, y1, x2, y2, color, width, emit) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.lineCap = "round";
            ctx.stroke();
        
            if (emit) {
              socket.emit("draw", { x1, y1, x2, y2, color, width });
            }
          }

          const scaleFactor = Math.min(
            canvas.width / 1920,
            canvas.height / 1080
          );
          ctx.scale(scaleFactor, scaleFactor);

          const filteredData = drawingData.filter(
            (data) => data.sessionID === sessionId
          );
          filteredData.forEach((data) => {
            drawLine(
              data.x1,
              data.y1,
              data.x2,
              data.y2,
              data.color,
              data.width,
              false
            );
          });
        });
      });
  }
  renderDrawings();

  //Clears Canvas of all drawings
  const clearCanvas = document.getElementById("clear-canvas");
  clearCanvas.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the canvas?")) {
      fetch("/clearCanvas", {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            location.reload();
          } else {
            alert("Error clearing canvas");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  });

  //Deletes all drawings for a specific session ID
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const sessionId = this.getAttribute("data-session-id");
      if (
        confirm(
          `Are you sure you want to delete all drawings for session ID: ${sessionId}?`
        )
      ) {
        fetch(`/delete/${sessionId}`, {
          method: "DELETE",
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              location.reload();
            } else {
              alert("Error deleting drawings");
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    });
  });

  const banButtons = document.querySelectorAll(".ban-btn");
  banButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const sessionId = this.getAttribute("data-session-id");
      if (confirm(`Are you sure you want to ban session ID: ${sessionId}?`)) {
        fetch(`/ban/${sessionId}`, {
          method: "POST",
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              alert("Session ID banned successfully");
              location.reload();
              fetch(`/delete/${sessionId}`, {
                method: "DELETE",
              })
                .then((response) => response.json())
                .then((data) => {
                  if (!data.success) {
                    alert("Error deleting drawings");
                  }
                })
                .catch((error) => {
                  console.error("Error:", error);
                });
            } else {
              alert("Error banning session ID");
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    });
  });

  const unbanButtons = document.querySelectorAll(".unban-btn");
  unbanButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const sessionId = this.getAttribute("data-session-id");
      if (confirm(`Are you sure you want to unban session ID: ${sessionId}?`)) {
        fetch(`/unban/${sessionId}`, {
          method: "DELETE",
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              location.reload();
              alert("Session ID unbanned successfully");
            } else {
              alert("Error unbanning session ID");
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    });
  });
});
