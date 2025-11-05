document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const titleEl = document.getElementById('carTitle');
    const subtitleEl = document.getElementById('carSubtitle');
    const detailsEl = document.getElementById('carDetails');
    const descriptionEl = document.getElementById('carDescription');
    const featuresEl = document.getElementById('carFeatures');
    const mainImage = document.getElementById('mainImage');
    const thumbs = document.getElementById('galleryThumbs');
    const specsEl = document.getElementById('carSpecs');

    if (!slug || !window.CarData) {
        if (subtitleEl) subtitleEl.textContent = 'Automobilis nerastas.';
        return;
    }

    try {
        const car = await window.CarData.getCar(slug);
        if (!car) {
            if (subtitleEl) subtitleEl.textContent = 'Automobilio duomenų rasti nepavyko.';
            if (detailsEl) detailsEl.innerHTML = '<p data-empty>Paspauskite „Automobiliai“ ir pasirinkite kitą pasiūlymą.</p>';
            return;
        }

        titleEl.textContent = car.title;
        subtitleEl.textContent = `${car.year} m. | ${car.mileage.toLocaleString('lt-LT')} km | ${car.fuel}`;

        const gallery = car.gallery && car.gallery.length ? car.gallery : ['https://placehold.co/800x500?text=MB+Kreicas'];
        let activeImage = gallery[0];
        mainImage.src = activeImage;
        mainImage.alt = car.title;

        thumbs.innerHTML = gallery
            .map(
                (src, index) => `
                    <button type="button" class="${index === 0 ? 'active' : ''}" data-src="${src}">
                        <img src="${src}" alt="${car.title} nuotrauka ${index + 1}" loading="lazy" />
                    </button>
                `
            )
            .join('');

        thumbs.querySelectorAll('button').forEach((button) => {
            button.addEventListener('click', () => {
                thumbs.querySelectorAll('button').forEach((btn) => btn.classList.remove('active'));
                button.classList.add('active');
                mainImage.src = button.dataset.src;
            });
        });

        const specItems = [
            { label: 'Kaina', value: `${car.price.toLocaleString('lt-LT')} €` },
            { label: 'Metai', value: car.year },
            { label: 'Rida', value: `${car.mileage.toLocaleString('lt-LT')} km` },
            { label: 'Kuras', value: car.fuel },
            { label: 'Pavarų dėžė', value: car.transmission },
            { label: 'Varantieji ratai', value: car.drivetrain || 'Nenurodyta' },
            { label: 'Galia', value: car.power ? `${car.power} kW` : 'Nenurodyta' },
            { label: 'Kėbulas', value: car.body || 'Nenurodyta' },
            { label: 'Spalva', value: car.color || 'Nenurodyta' },
            { label: 'VIN', value: car.vin || 'Pateikiama apžiūros metu' },
        ];

        specsEl.innerHTML = `
            <div class="spec-grid">
                ${specItems
                    .map(
                        (item) => `
                            <div class="spec-item">
                                <span>${item.label}</span>
                                <strong>${item.value}</strong>
                            </div>
                        `
                    )
                    .join('')}
            </div>
        `;

        descriptionEl.innerHTML = `
            <h2>Aprašymas</h2>
            <p>${car.description}</p>
        `;

        if (car.features && car.features.length) {
            featuresEl.innerHTML = `
                <h2>Įranga</h2>
                <ul class="features-list">
                    ${car.features.map((feature) => `<li>${feature}</li>`).join('')}
                </ul>
            `;
        } else {
            featuresEl.innerHTML = '<p data-empty>Įrangos sąrašas bus pateiktas artimiausiu metu.</p>';
        }
    } catch (error) {
        console.error(error);
        subtitleEl.textContent = 'Įvyko klaida įkeliant automobilį.';
        detailsEl.innerHTML = '<p data-empty>Pabandykite atnaujinti puslapį arba grįžkite į sąrašą.</p>';
    }
});
