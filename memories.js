(() => {
    // --------------------------------------------------
    // SUPABASE CONNECTION
    // --------------------------------------------------

    const SUPABASE_URL = "https://csehwqtvjppvnsdhgejp.supabase.co";
    const SUPABASE_KEY = "sb_publishable_iA48IduZgELleVpvNhsMKA_boG4QTAP";

    const supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


    // --------------------------------------------------
    // PAGE ELEMENTS
    // --------------------------------------------------

    const form = document.getElementById("memory-form");
    const photoInput = document.getElementById("memory-photos");
    const photoPreview = document.getElementById("photo-preview");
    const memoryContainer = document.getElementById("memories-container");
    const formStatus = document.getElementById("form-status");

    if (!form || !photoInput || !photoPreview || !memoryContainer || !formStatus) {
        return;
    }


    // --------------------------------------------------
    // PHOTO PREVIEW
    // --------------------------------------------------

    const maxPhotos = 5;
    const maxPhotoSize = 5 * 1024 * 1024;

    let selectedPhotos = [];
    let previewUrls = [];

    function clearPreviewUrls() {
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        previewUrls = [];
    }

    function renderPreview() {
        clearPreviewUrls();
        photoPreview.replaceChildren();

        selectedPhotos.forEach(photo => {
            const image = document.createElement("img");

            const url = URL.createObjectURL(photo);
            previewUrls.push(url);

            image.src = url;
            image.alt = "Selected photo";

            photoPreview.append(image);
        });
    }


    photoInput.addEventListener("change", () => {
        const photos = Array.from(photoInput.files || []);

        const invalidPhoto = photos.find(photo =>
            !photo.type.startsWith("image/") ||
            photo.size > maxPhotoSize
        );

        if (photos.length > maxPhotos) {
            photoInput.value = "";
            selectedPhotos = [];
            renderPreview();

            formStatus.textContent =
                `Choose no more than ${maxPhotos} photos.`;

            return;
        }

        if (invalidPhoto) {
            photoInput.value = "";
            selectedPhotos = [];
            renderPreview();

            formStatus.textContent =
                "Choose image files no larger than 5 MB each.";

            return;
        }

        selectedPhotos = photos;
        renderPreview();

        formStatus.textContent = photos.length
            ? `${photos.length} photo${photos.length === 1 ? "" : "s"} selected.`
            : "";
    });


    // --------------------------------------------------
    // SUBMIT MEMORY
    // --------------------------------------------------

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const message = form.elements.message.value.trim();

        if (!message) {
            form.elements.message.focus();
            return;
        }

        formStatus.textContent = "Submitting your memory...";

        const memory = {
            name: form.elements.name.value.trim() || null,

            relationship:
                form.elements.relationship.value.trim() || null,

            message: message,

            anonymous:
                form.elements.anonymous.checked,

            simon:
                form.elements.Simon.checked,

            jack:
                form.elements.Jack.checked,

            evan:
                form.elements.Evan.checked
        };

        try {

            const { error } = await supabaseClient
            .from("memories")
            .insert(memory);

                if (error) {
                throw error;
                }

            console.log("Memory submitted successfully");

            formStatus.textContent =
                "Thank you for sharing this memory. It will appear after it has been reviewed.";

            form.reset();

            selectedPhotos = [];
            renderPreview();

        } catch (error) {

            console.error("Submission error:", error);

            formStatus.textContent =
                "Something went wrong while submitting your memory. Please try again.";
        }
    });


    // --------------------------------------------------
    // LOAD APPROVED MEMORIES
    // --------------------------------------------------

    async function loadMemories() {

        const { data, error } = await supabaseClient
            .from("memories")
            .select("*")
            .eq("approved", true)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Unable to load memories:", error);
            return;
        }

        renderEntries(data || []);
    }


    // --------------------------------------------------
    // DISPLAY MEMORIES
    // --------------------------------------------------

    function renderEntries(entries) {

        memoryContainer.replaceChildren();

        entries.forEach(entry => {

            const card = document.createElement("article");
            card.className = "memory-card";


            // Who the memory is about

            const people = [];

            if (entry.simon) people.push("Simon");
            if (entry.jack) people.push("Jack");
            if (entry.evan) people.push("Evan");

            if (people.length) {
                const about = document.createElement("p");
                about.className = "memory-about";

                about.textContent =
                    `In memory of ${people.join(", ")}`;

                card.append(about);
            }


            // Message

            const message = document.createElement("p");
            message.className = "memory-message";

            message.textContent = entry.message;

            card.append(message);


            // Name / relationship

            if (!entry.anonymous && entry.name) {

                const author = document.createElement("p");
                author.className = "memory-author";

                author.textContent = entry.relationship
                    ? `${entry.name} — ${entry.relationship}`
                    : entry.name;

                card.append(author);
            }


            memoryContainer.append(card);
        });
    }


    loadMemories();

})();