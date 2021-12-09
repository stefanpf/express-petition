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
            context.strokeStyle = "blue";
            context.beginPath();
            context.moveTo(
                evt.pageX - evt.currentTarget.offsetLeft,
                evt.pageY - evt.currentTarget.offsetTop
            );
            console.log(
                evt.pageX - evt.currentTarget.offsetLeft,
                evt.pageY - evt.currentTarget.offsetTop
            );
            context.lineTo(
                evt.pageX - evt.currentTarget.offsetLeft,
                evt.pageY - evt.currentTarget.offsetTop
            );
            context.stroke();
        }
    });
})();
