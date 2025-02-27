// useAllCitiesData.jsx
import { useState, useEffect } from 'react';

const useAllCitiesData = () => {
    console.log("useAllCitiesData hook started");

    const [citiesByRegion, setCitiesByRegion] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    console.log("useAllCitiesData initial state:", { isLoading, error, citiesByRegion });

    useEffect(() => {
        console.log("useAllCitiesData useEffect started");

        const regionIds = ["091", "092", "093", "094", "095", "096", "097"];
        const githubApiTreeUrl = 'https://api.github.com/repos/Kirman442/deckgl/git/trees/main?recursive=1'; // <-- URL GitHub API для дерева файлов

        const loadAllCities = async () => {
            console.log("loadAllCities async function started");
            setIsLoading(true);
            setError(null);
            console.log("State updated - setIsLoading(true), setError(null):", { isLoading, error });

            const loadedCitiesByRegion = {};

            try {
                // 1. Загрузка дерева файлов из GitHub API
                console.log("Fetching file tree from GitHub API:", githubApiTreeUrl); // <-- Лог запроса к API
                const apiResponse = await fetch(githubApiTreeUrl);
                if (!apiResponse.ok) {
                    throw new Error(`Ошибка загрузки дерева файлов из GitHub API: ${apiResponse.status} ${apiResponse.statusText}`);
                }
                const apiData = await apiResponse.json();
                console.log("GitHub API file tree загружен успешно:", apiData); // <-- Лог успешной загрузки дерева файлов
                const files = apiData.tree; // Массив объектов файлов и директорий

                const geojsonFilesInfo = files.filter(file => // 2. Фильтрация GeoJSON файлов в директории cities
                    file.type === 'blob' && // Это файл (не директория)
                    file.path.startsWith('cities/') && // Путь начинается с "cities/"
                    file.path.endsWith('.geojson')  // Путь заканчивается на ".geojson"
                );
                console.log(`Найдено ${geojsonFilesInfo.length} GeoJSON файлов в директории cities:`, geojsonFilesInfo); // <-- Лог найденных файлов

                // 3. Обработка найденных файлов и загрузка данных
                for (const fileInfo of geojsonFilesInfo) {
                    const filePath = fileInfo.path;
                    const rawFileUrl = `https://raw.githubusercontent.com/Kirman442/deckgl/main/${filePath}`; // 4. Формирование raw URL
                    console.log(`Обработка файла: path="${filePath}", rawUrl="${rawFileUrl}"`); // <-- Лог обработки файла

                    const regionIdMatch = filePath.match(/cities\/(\d+)\//); // Регулярное выражение для regionId
                    const districtIdMatch = filePath.match(/district_(\d+)\.geojson/); // Регулярное выражение для districtId
                    let regionId = regionIdMatch ? regionIdMatch[1] : 'unknown_region'; // Извлекаем regionId или ставим 'unknown_region'
                    let districtId = districtIdMatch ? districtIdMatch[1] : 'unknown_district'; // Извлекаем districtId или ставим 'unknown_district'
                    console.log(`Извлечены regionId="${regionId}", districtId="${districtId}" из path="${filePath}"`); // <-- Лог извлеченных id

                    try {
                        const response = await fetch(rawFileUrl); // 5. Загрузка данных из raw URL
                        if (!response.ok) {
                            throw new Error(`Ошибка загрузки GeoJSON файла: ${rawFileUrl} (${response.status} ${response.statusText})`);
                        }
                        const geojson = await response.json();
                        console.log(`GeoJSON данные успешно загружены из: ${rawFileUrl}`, geojson); // <-- Лог успешной загрузки GeoJSON

                        if (!loadedCitiesByRegion[regionId]) { // Если еще нет объекта для regionId, создаем его
                            loadedCitiesByRegion[regionId] = {};
                        }
                        loadedCitiesByRegion[regionId][districtId] = geojson.features; // 6. Организация данных: сохраняем города для districtId в объекте regionId

                    } catch (fileError) {
                        console.error(`Ошибка при загрузке или обработке файла ${rawFileUrl}:`, fileError); // <-- Лог ошибок загрузки/обработки файла
                    }
                }

                setCitiesByRegion(loadedCitiesByRegion); // 7. Обновление состояния citiesByRegion
                setIsLoading(false);
                console.log("State updated - setCitiesByRegion, setIsLoading(false):", { isLoading, citiesByRegion });

            } catch (apiError) {
                setError(apiError);
                setIsLoading(false);
                console.log("State updated - setError, setIsLoading(false) in catch (API error):", { isLoading, error });
                console.error("Ошибка при загрузке данных о городах (ошибка API):", apiError); // <-- Лог ошибок API
            }
            console.log("loadAllCities async function finished");
        };

        loadAllCities();
        console.log("loadAllCities function call initiated");
    }, []);

    console.log("useAllCitiesData hook finished (returned state):", { isLoading, error, citiesByRegion });
    console.dir(citiesByRegion)
    return { citiesByRegion, isLoading, error };
};

export default useAllCitiesData;