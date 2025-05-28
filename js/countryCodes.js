// js/countryCodes.js
const countryCodes = [
    { name: 'Afghanistan (+93)', code: '+93' },
    { name: 'Albania (+355)', code: '+355' },
    { name: 'Algeria (+213)', code: '+213' },
    { name: 'American Samoa (+1-684)', code: '+1-684' },
    { name: 'Andorra (+376)', code: '+376' },
    { name: 'Angola (+244)', code: '+244' },
    // ... many more countries
    { name: 'Colombia (+57)', code: '+57' },
    { name: 'Spain (+34)', code: '+34' },
    { name: 'United States (+1)', code: '+1' },
    { name: 'Venezuela (+58)', code: '+58' },
    { name: 'Yemen (+967)', code: '+967' },
    { name: 'Zambia (+260)', code: '+260' },
    { name: 'Zimbabwe (+263)', code: '+263' }
];

function populateCountryCodes(selectElementId) {
    const select = document.getElementById(selectElementId);
    if (!select) return;

    // Clear existing options except for a possible default/placeholder
    while (select.options.length > 0) {
        select.remove(0);
    }
    
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "Selecciona código...";
    select.appendChild(defaultOption);

    countryCodes.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = `${country.name}`;
        select.appendChild(option);
    });
}