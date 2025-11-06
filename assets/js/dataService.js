(function () {
    const STORAGE_KEY = 'mbk_cars_v1';
    let cache = null;

    const fetchDefaults = async () => {
        const response = await fetch('assets/data/cars.json');
        if (!response.ok) throw new Error('Nepavyko įkelti automobilių duomenų.');
        return response.json();
    };

    const generateSlug = (text) =>
        text
            .toLowerCase()
            .replace(/[^a-z0-9ąčęėįšųūž\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');

    const ensureUniqueSlug = (slug, existing) => {
        let base = slug || '';
        if (!base) {
            base = `auto-${Date.now()}`;
        }
        let candidate = base;
        let counter = 1;
        while (existing.has(candidate)) {
            candidate = `${base}-${counter}`;
            counter += 1;
        }
        existing.add(candidate);
        return candidate;
    };

    const normalizeCar = (car, existingSlugs) => {
        const normalized = { ...car };

        if (!normalized.title && normalized.name) {
            normalized.title = normalized.name;
        }

        const fallbackSource = normalized.title || normalized.name || normalized.id || `auto-${Date.now()}`;
        let slugCandidate = normalized.slug;
        if (!slugCandidate || slugCandidate === 'undefined' || slugCandidate === 'null') {
            slugCandidate = generateSlug(String(fallbackSource));
        }

        normalized.slug = ensureUniqueSlug(slugCandidate, existingSlugs);

        if (!normalized.id) {
            normalized.id = normalized.slug;
        }

        if (!Array.isArray(normalized.gallery)) {
            normalized.gallery = [];
        }

        return normalized;
    };

    const normalizeCars = (cars) => {
        const existingSlugs = new Set();
        return cars.map((car) => normalizeCar(car, existingSlugs));
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
            const normalized = normalizeCars(stored);
            cache = normalized;
            if (JSON.stringify(normalized) !== JSON.stringify(stored)) {
                writeToStorage(normalized);
            }
            return normalized;
        }
        const defaults = await fetchDefaults();
        const normalizedDefaults = normalizeCars(defaults);
        cache = normalizedDefaults;
        writeToStorage(normalizedDefaults);
        return normalizedDefaults;
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
        const normalized = normalizeCars(cars);
        const targetIndex = index >= 0 ? index : normalized.length - 1;
        saveCars(normalized);
        return normalized[targetIndex];
    };

    const deleteCar = (slug) => {
        if (!cache) return;
        const filtered = cache.filter((item) => item.slug !== slug && String(item.id) !== String(slug));
        saveCars(filtered);
    };

    const resetCars = async () => {
        const defaults = await fetchDefaults();
        const normalizedDefaults = normalizeCars(defaults);
        saveCars(normalizedDefaults);
        return normalizedDefaults;
    };

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
