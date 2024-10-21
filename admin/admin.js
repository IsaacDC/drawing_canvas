document.addEventListener("DOMContentLoaded", function () {
  socket = io.connect();

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
  const sessionCanvases = document.querySelectorAll(".session-canvas");
  sessionCanvases.forEach((canvas) => {
    const sessionId = canvas.getAttribute("data-session-id");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //logic for drawing
    function drawLine(startX, startY, endX, endY, color, width) {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    // scales the tables canvas down in respective to the main canvas
    const scaleFactor = Math.min(canvas.width / 2560, canvas.height / 1440);
    ctx.scale(scaleFactor, scaleFactor);

    // filters the drawing
    const filteredData = drawingData.filter(
      (data) => data.sessionId === sessionId
    );
    filteredData.forEach((data) => {
      drawLine(
        data.startX,
        data.startY,
        data.endX,
        data.endY,
        data.color,
        data.width
      );
    });
  });

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
            socket.emit("trashDrawings");
          } else {
            alert("Error clearing canvas");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  });

  //Deletes all drawings for a specific session
  const deleteButtons = document.querySelectorAll("#delete-btn");
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
              socket.emit("trashDrawings");
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

  const banButtons = document.querySelectorAll("#ban-btn");
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
              socket.emit("trashDrawings");
            } else {
              throw new Error("Error deleting drawings");
            }
          })
          .catch((error) => {
            alert(error.message);
            console.error("Error:", error);
          });
      }
    });
  });

  const unbanButtons = document.querySelectorAll("#unban-btn");
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
