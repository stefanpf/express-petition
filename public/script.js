(function () {
    let signatureField = document.getElementById("signature");
    let drawing = false;
    const canvas = document.getElementById("canv");
    let context = canvas.getContext("2d");

    canvas.addEventListener("mousedown", () => {
        drawing = true;
    });

    canvas.addEventListener("mouseup", () => {
        signatureField.value = canvas.toDataURL();
        console.log(signatureField.value);
        drawing = false;
    });

    canvas.addEventListener("mousemove", (evt) => {
        if (drawing) {
            context.strokeStyle = "white";
            context.lineWidth = 5;
            context.beginPath();
            context.moveTo(
                evt.pageX - evt.currentTarget.offsetLeft,
                evt.pageY - evt.currentTarget.offsetTop
            );
            context.lineTo(
                evt.pageX - evt.currentTarget.offsetLeft + 1,
                evt.pageY - evt.currentTarget.offsetTop + 1
            );
            context.stroke();
        }
    });
})();
