
document.addEventListener("DOMContentLoaded", function () {
  const socket = io.connect();

  function login() {
    let username = "";
    let password = "";

    while (true) {
      username = prompt("Enter your username:");
      if (username === null || username.trim() === "") {
        alert("Please enter a username to continue.");
        continue;
      }

      password = prompt("Enter your password:");
      if (password === null || password.trim() === "") {
        alert("Please enter a password to continue.");
        continue;
      }

      if (username === "admin" && password === "password") {
        break;

      } else {
        alert("Invalid username or password. Please try again.");
      }
    }
  }

  login();

  //loads drawings for each canvas per session respectfully
  function renderDrawings() {
    socket.on("loadDrawingData", (drawingData) => {
      const sessionCanvases = document.querySelectorAll(".session-canvas");

      sessionCanvases.forEach((canvas) => {
        const sessionId = canvas.getAttribute("data-session-id");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scaleFactor = Math.min(canvas.width / 1280, canvas.height / 720);
        ctx.scale(scaleFactor, scaleFactor);

        const filteredData = drawingData.filter(
          (data) => data.sessionID === sessionId
        );
        filteredData.forEach((data) => {
          if (data.type === "start") {
            ctx.beginPath();
            ctx.moveTo(data.x, data.y);
            ctx.strokeStyle = data.color;
            ctx.lineWidth = data.width;
            ctx.lineCap = "round";
          } else if (data.type === "draw") {
            ctx.lineTo(data.x, data.y);
            ctx.strokeStyle = data.color;
            ctx.lineWidth = data.width;
            ctx.lineCap = "round";
            ctx.stroke();
          } else if (data.type === "stop") {
            ctx.beginPath();
          }
        });
      });
    });
  }
  renderDrawings();


  //Clears Canvas of all drawings
  const clearCanvas = document.getElementById("clear-canvas");
  clearCanvas.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the canvas?")) {
      fetch("/clear", {
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
});
