document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('carForm');
    const listEl = document.getElementById('adminList');
    const exportBtn = document.getElementById('exportCars');
    const importInput = document.getElementById('importCars');
    const resetBtn = document.getElementById('resetCars');

    if (!form || !listEl || !window.CarData) return;

    let cars = [];
    let editingSlug = null;

    const loadCars = async () => {
        cars = await window.CarData.getCars();
        renderList();
    };

    const renderList = () => {
        if (!cars.length) {
            listEl.innerHTML = '<p data-empty>Sąrašas tuščias. Pridėkite pirmą automobilį.</p>';
            return;
        }

        listEl.innerHTML = cars
            .map(
                (car) => `
                    <div class="admin-item">
                        <span class="admin-item__title">${car.title}</span>
                        <span class="admin-item__meta">${car.year} m. • ${car.mileage.toLocaleString('lt-LT')} km • ${car.price.toLocaleString('lt-LT')} €</span>
                        <div class="admin-item__actions">
                            <button type="button" data-edit="${car.slug}">Redaguoti</button>
                            <button type="button" class="delete" data-delete="${car.slug}">Ištrinti</button>
                        </div>
                    </div>
                `
            )
            .join('');

        listEl.querySelectorAll('[data-edit]').forEach((button) => {
            button.addEventListener('click', () => startEdit(button.dataset.edit));
        });

        listEl.querySelectorAll('[data-delete]').forEach((button) => {
            button.addEventListener('click', () => deleteCar(button.dataset.delete));
        });
    };

    const startEdit = (slug) => {
        const car = cars.find((item) => item.slug === slug);
        if (!car) return;
        editingSlug = car.slug;
        form.querySelector('#carTitleInput').value = car.title;
        form.querySelector('#carPrice').value = car.price;
        form.querySelector('#carYear').value = car.year;
        form.querySelector('#carMileage').value = car.mileage;
        form.querySelector('#carFuel').value = car.fuel;
        form.querySelector('#carTransmission').value = car.transmission;
        form.querySelector('#carDrivetrain').value = car.drivetrain || '';
        form.querySelector('#carPower').value = car.power || '';
        form.querySelector('#carBody').value = car.body || '';
        form.querySelector('#carColor').value = car.color || '';
        form.querySelector('#carDescriptionInput').value = car.description || '';
        form.querySelector('#carFeatures').value = car.features ? car.features.join(', ') : '';
        form.querySelector('#carGallery').value = car.gallery ? car.gallery.join(', ') : '';
        form.querySelector('#carVin').value = car.vin || '';
        form.querySelector('button[type="submit"]').textContent = 'Atnaujinti automobilį';
        form.scrollIntoView({ behavior: 'smooth' });
    };

    const deleteCar = async (slug) => {
        if (!confirm('Ar tikrai norite pašalinti automobilį?')) return;
        await window.CarData.deleteCar(slug);
        await loadCars();
    };

    const resetForm = () => {
        form.reset();
        editingSlug = null;
        form.querySelector('button[type="submit"]').textContent = 'Išsaugoti automobilį';
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        const title = form.querySelector('#carTitleInput').value.trim();
        const price = Number(form.querySelector('#carPrice').value);
        const year = Number(form.querySelector('#carYear').value);
        const mileage = Number(form.querySelector('#carMileage').value);
        const fuel = form.querySelector('#carFuel').value.trim();
        const transmission = form.querySelector('#carTransmission').value.trim();
        const drivetrain = form.querySelector('#carDrivetrain').value.trim();
        const power = Number(form.querySelector('#carPower').value) || null;
        const body = form.querySelector('#carBody').value.trim();
        const color = form.querySelector('#carColor').value.trim();
        const description = form.querySelector('#carDescriptionInput').value.trim();
        const features = form
            .querySelector('#carFeatures')
            .value.split(',')
            .map((item) => item.trim())
            .filter(Boolean);
        const gallery = form
            .querySelector('#carGallery')
            .value.split(',')
            .map((item) => item.trim())
            .filter(Boolean);
        const vin = form.querySelector('#carVin').value.trim();

        const slug = editingSlug || window.CarData.generateSlug(title);

        const car = {
            slug,
            title,
            price,
            year,
            mileage,
            fuel,
            transmission,
            drivetrain,
            power,
            body,
            color,
            description,
            features,
            gallery,
            vin,
        };

        await window.CarData.upsertCar(car);
        await loadCars();
        resetForm();
        submitBtn.disabled = false;
        alert('Automobilis išsaugotas!');
    });

    exportBtn.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(cars, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'mb-kreicas-automobiliai.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    importInput.addEventListener('change', (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!Array.isArray(data)) throw new Error('Neteisingas failo formatas.');
                window.CarData.saveCars(data);
                await loadCars();
                alert('Automobiliai sėkmingai importuoti.');
            } catch (error) {
                alert('Nepavyko importuoti: ' + error.message);
            } finally {
                importInput.value = '';
            }
        };
        reader.readAsText(file);
    });

    resetBtn.addEventListener('click', async () => {
        if (!confirm('Atstatyti numatytą automobilių sąrašą? Visi vietiniai pakeitimai bus prarasti.')) return;
        await window.CarData.resetCars();
        await loadCars();
    });

    window.addEventListener('cars:updated', loadCars);

    loadCars();
});
