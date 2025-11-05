(function () {
    const STORAGE_KEY = 'mbk_cars_v1';
    let cache = null;

    const fetchDefaults = async () => {
        const response = await fetch('assets/data/cars.json');
        if (!response.ok) throw new Error('Nepavyko įkelti automobilių duomenų.');
        return response.json();
    };

    const readFromStorage = () => {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) throw new Error('Blogas formatas');
            return parsed;
        } catch (error) {
            console.warn('Nepavyko nuskaityti automobilių iš saugyklos:', error);
            return null;
        }
    };

    const writeToStorage = (cars) => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
        } catch (error) {
            console.warn('Nepavyko išsaugoti automobilių:', error);
        }
    };

    const notify = () => {
        window.dispatchEvent(new CustomEvent('cars:updated'));
    };

    const ensureData = async () => {
        if (cache) return cache;
        const stored = readFromStorage();
        if (stored) {
            cache = stored;
            return stored;
        }
        const defaults = await fetchDefaults();
        cache = defaults;
        writeToStorage(defaults);
        return defaults;
    };

    const getCars = async () => {
        const cars = await ensureData();
        return cars;
    };

    const getCar = async (slug) => {
        const cars = await ensureData();
        return cars.find((item) => item.slug === slug || String(item.id) === String(slug));
    };

    const saveCars = (cars) => {
        cache = cars;
        writeToStorage(cars);
        notify();
        return cars;
    };

    const upsertCar = (car) => {
        if (!car.slug) {
            car.slug = generateSlug(car.title || car.name || `auto-${Date.now()}`);
        }
        const cars = cache ? [...cache] : [];
        const index = cars.findIndex((item) => item.slug === car.slug || item.id === car.id);
        if (index >= 0) {
            cars[index] = { ...cars[index], ...car };
        } else {
            cars.push({ id: crypto.randomUUID ? crypto.randomUUID() : Date.now(), ...car });
        }
        saveCars(cars);
        return car;
    };

    const deleteCar = (slug) => {
        if (!cache) return;
        const filtered = cache.filter((item) => item.slug !== slug && String(item.id) !== String(slug));
        saveCars(filtered);
    };

    const resetCars = async () => {
        const defaults = await fetchDefaults();
        saveCars(defaults);
        return defaults;
    };

    const generateSlug = (text) =>
        text
            .toLowerCase()
            .replace(/[^a-z0-9ąčęėįšųūž\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');

    window.CarData = {
        STORAGE_KEY,
        getCars,
        getCar,
        saveCars,
        upsertCar,
        deleteCar,
        resetCars,
        generateSlug,
    };
})();
