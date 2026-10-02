(() => {
    const slides = Array.from(document.querySelectorAll(".hero-slide"));

    if (slides.length < 2) {
        return;
    }

    const starterPhotos = [
        "s1.JPG",
        "s2.JPG",
        "s3.JPG",
        "s4.JPG",
        "s5.JPG",
        "s6.JPG",
        "s7.JPG"
    ];

    let currentPhoto = 0;
    let activeSlide = 0;

    function showPhoto(index) {
        const nextSlideIndex = 1 - activeSlide;
        const nextSlide = slides[nextSlideIndex];

        nextSlide.src = starterPhotos[index];
        nextSlide.classList.add("is-active");
        slides[activeSlide].classList.remove("is-active");
        activeSlide = nextSlideIndex;
    }

    slides[0].src = starterPhotos[0];
    slides[0].classList.add("is-active");
    window.setInterval(() => {
        currentPhoto = (currentPhoto + 1) % starterPhotos.length;
        showPhoto(currentPhoto);
    }, 6000);
})();