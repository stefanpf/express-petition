(function () {
    let outerBar = document.querySelector(".progress-bar-outer");
    let innerBar = document.querySelector(".progress-bar-inner");
    let percentageProgress = (innerBar.innerText.slice(0, -1) * 0.01).toFixed(
        2
    );
    innerBar.style.width = outerBar.offsetWidth * percentageProgress + "px";
})();
