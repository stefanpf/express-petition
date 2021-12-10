(function () {
    let signatureField = document.getElementById("signature");
    let drawing = false;
    let coordinates = [0, 0];
    const canvas = document.getElementById("canv");
    let context = canvas.getContext("2d");

    canvas.addEventListener("mousedown", (evt) => {
        coordinates = updateCoordinates(coordinates, evt);
        drawing = true;
    });

    canvas.addEventListener("mouseup", () => {
        signatureField.value = canvas.toDataURL();
        drawing = false;
    });

    canvas.addEventListener("mousemove", (evt) => {
        if (drawing) {
            context.strokeStyle = "white";
            context.lineWidth = 3;
            context.beginPath();
            context.moveTo(coordinates[0], coordinates[1]);
            coordinates = updateCoordinates(coordinates, evt);
            context.lineTo(coordinates[0], coordinates[1]);
            context.stroke();
        }
    });

    function updateCoordinates(coordinates, evt) {
        coordinates[0] = evt.pageX - evt.currentTarget.offsetLeft; // evt.offsetLeft
        coordinates[1] = evt.pageY - evt.currentTarget.offsetTop; // evt.offsetTop
        return coordinates;
    }
})();
