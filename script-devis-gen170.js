function isEventAfter22h00(eventTimeString) {
    const parts = eventTimeString.split(' au ');
    const endTimeString = parts.length > 1 ? parts[1] : '';
    const timePart = endTimeString.split('à')[1].trim();
    const [hours, minutes] = timePart.split('h').map(Number);
    return hours >= 22 || (hours < 6 && hours >= 0);
}

function parseEventTimes(eventTimeString) {
    const parts = eventTimeString.split(' au ');
    const startTimeString = parts[0];
    const endTimeString = parts.length > 1 ? parts[1] : '';
    const start = startTimeString.split('à')[1].trim();
    const [startHours, startMinutes] = start.split('h').map(Number);
    const end = endTimeString.split('à')[1].trim();
    const [endHours, endMinutes] = end.split('h').map(Number);
    return { startHours, startMinutes, endHours, endMinutes, isEventAfter22h00: endHours >= 22 || (endHours < 6 && endHours >= 0) };
}

function convertHoursToMinutes(hours, minutes) {
    return hours * 60 + minutes;
}

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}h${mins.toString().padStart(2, '0')}`;
}

function calculateStaffCost(staffType, hours) {
    let costPerHour;
    switch (staffType) {
        case 'securite':
            costPerHour = 35;
            break;
        case 'traiteur':
            costPerHour = 35;
            break;
        case 'regisseur':
            costPerHour = 40;
            break;
        default:
            costPerHour = 0;
    }
    return costPerHour * hours;
}

function updateStaffTimeUI(staffType, arrival, departure) {
    const arrivalTime = formatTime(arrival);
    const departureTime = formatTime(departure);
    const duration = (departure - arrival) / 60;
    const staffCost = calculateStaffCost(staffType, duration);
    $(`#temps-${staffType}`).text(`Le staff ${staffType} arrivera à ${arrivalTime} et partira à ${departureTime}. Pour un total de ${duration.toFixed(2)} heures, le prix sera de ${staffCost.toFixed(2)}€.`);
}

$(document).ready(function() {
    let initialPriceSalle = Number($('.price-salle').text().replace(/[^0-9.-]+/g, "").replace(',', '.'));
    console.log(`Initial Price Salle converted to number: ${initialPriceSalle}`);
    let initialPriceTraiteurPerso = 120;
    $('.price-traiteur-perso').text(initialPriceTraiteurPerso);

    $('.ms-radio-button-tab-is-1, .ms-radio-button-tab-is-2, .ms-radio-button-tab-is-3, .ms-radio-button-tab-is-4, .ms-radio-button-tab-is-5').click(function() {
        const eventTimeString = $('#data-text-item-check').text();
        const { startHours, startMinutes, endHours, endMinutes } = parseEventTimes(eventTimeString);
        const isRadio4Or5 = $(this).hasClass('ms-radio-button-tab-is-4') || $(this).hasClass('ms-radio-button-tab-is-5');
        if (isRadio4Or5) {
            $('#nombre-equipier-traiteur').text('0');
            adjustStaffForScenario1(startHours, startMinutes, endHours, endMinutes);
        } else {
            adjustStaffForScenario2(startHours, startMinutes, endHours, endMinutes);
        }
        resetPricingCalculator();
    });

    function adjustStaffForScenario1(startHours, startMinutes, endHours, endMinutes) {
        const eventStart = convertHoursToMinutes(startHours, startMinutes);
        const eventEnd = convertHoursToMinutes(endHours, endMinutes);
        const securityArrival = eventStart < 18 * 60 ? 17 * 60 + 30 : eventStart - 30;
        const securityDeparture = eventEnd + 30;
        const regisseurArrival = eventStart - 60;
        const regisseurDeparture = eventEnd + 60;
        updateStaffTimeUI('staff-securite', securityArrival, securityDeparture);
        updateStaffTimeUI('regisseur', regisseurArrival, regisseurDeparture);
        $('#temps-staff-traiteur').text("Catering staff not required.");
    }

    function adjustStaffForScenario2(startHours, startMinutes, endHours, endMinutes) {
        const eventStart = convertHoursToMinutes(startHours, startMinutes);
        const eventEnd = convertHoursToMinutes(endHours, endMinutes);
        adjustStaffForScenario1(startHours, startMinutes, endHours, endMinutes);
        const cateringArrival = eventStart - 120;
        const cateringDeparture = eventEnd + 60;
        const regisseurArrival = eventStart - 120;
        const regisseurDeparture = eventEnd + 60;
        updateStaffTimeUI('staff-traiteur', cateringArrival, cateringDeparture);
    }


    $('#nb-personnes-final-2').on('input', function() {
        updateTeamMembers();
        updatePricesAndTotal();
    });

    function updateTeamMembers() {
        const numberOfAttendees = parseInt($('#nb-personnes-final-2').val(), 10);
        if (!isNaN(numberOfAttendees)) {
            const cateringTeamMembers = getNumberOfCateringTeamMembers(numberOfAttendees);
            $('#nombre-equipier-traiteur').text(cateringTeamMembers !== "Error" ? cateringTeamMembers : '0');
            updateSecurityStaff($('#data-text-item-check').text(), numberOfAttendees);
        } else {
            console.log('Invalid input for number of attendees');
            $('#nombre-equipier-traiteur').text('0');
        }
    }

    function getNumberOfCateringTeamMembers(numberOfAttendees) {
        const cateringBrackets = [
            { min: 0, max: 49, team: 2 },
            { min: 50, max: 99, team: 3 },
            { min: 100, max: 149, team: 4 },
            { min: 150, max: 199, team: 5 },
            { min: 200, max: 249, team: 6 },
            { min: 250, max: 299, team: 7 },
            { min: 300, max: 349, team: 8 },
            { min: 350, max: 399, team: 9 },
            { min: 400, max: 449, team: 10 },
            { min: 450, max: 499, team: 11 },
            { min: 500, max: 549, team: 12 },
            { min: 550, max: 599, team: 13 },
            { min: 600, max: 649, team: 14 },
            { min: 650, max: 699, team: 15 },
            { min: 700, max: 749, team: 16 },
            { min: 750, max: 799, team: 17 },
            { min: 800, max: 849, team: 18 },
            { min: 850, max: 899, team: 19 },
            { min: 900, max: 949, team: 20 },
            { min: 950, max: 999, team: 21 }
        ];
        return cateringBrackets.find(bracket => numberOfAttendees >= bracket.min && numberOfAttendees <= bracket.max)?.team || "Error";
    }

    function getNumberOfSecurityMembers(numberOfAttendees) {
        const securityBrackets = [
            { min: 0, max: 99, team: 1 },
            { min: 100, max: 149, team: 2 },
            { min: 150, max: 199, team: 3 },
            { min: 200, max: 399, team: 4 },
            { min: 400, max: 599, team: 5 },
            { min: 600, max: 799, team: 6 },
            { min: 800, max: 999, team: 7 },
        ];
        return securityBrackets.find(bracket => numberOfAttendees >= bracket.min && numberOfAttendees <= bracket.max)?.team || "Error";
    }

    function updateSecurityStaff(eventTimeString, numberOfAttendees) {
        if (isEventAfter22h00(eventTimeString)) {
            const securityTeamMembers = getNumberOfSecurityMembers(numberOfAttendees);
            $('#nombre-securite').text(securityTeamMembers);
        } else {
            $('#nombre-securite').text(0);
        }
    }


    function resetPricingCalculator() {
        $('.checkbox-devis').prop('checked', false);
        $('.total-ht, .total-ttc, .price-tva').text('0,00');
        updatePricesAndTotal();
    }

    const updatePricesAndTotal = () => {
        let sumSpecialite1 = 0;
        let sumSpecialite2 = 0;
        let sumSpecialite3 = 0;
        let sumPetitdejeuner1 = 0;
        let sumPetitdejeuner2 = 0;
        let sumDejeuner1 = 0;
        let sumDejeuner2 = 0;
        let sumDejeuner3 = 0;
        let sumDejeuner4 = 0;
        let sumPause = 0;
        let sumDiner1 = 0;
        let sumDiner2 = 0;
        let sumDiner3 = 0;
    
        const numberOfPersonsSpecialite1 = Number($('.specialite-number-1').val());
        const numberOfPersonsSpecialite2 = Number($('.specialite-number-2').val());
        const numberOfPersonsSpecialite3 = Number($('.specialite-number-3').val());
        const numberOfPersonsPetitdejeuner1 = Number($('.petit-dejeuner-number-1').val());
        const numberOfPersonsPetitdejeuner2 = Number($('.petit-dejeuner-number-2').val());
        const numberOfPersonsDejeuner1 = Number($('.dejeuner-number-1').val());
        const numberOfPersonsDejeuner2 = Number($('.dejeuner-number-2').val());
        const numberOfPersonsDejeuner3 = Number($('.dejeuner-number-3').val());
        const numberOfPersonsDejeuner4 = Number($('.dejeuner-number-4').val());
        const numberOfPersonsPause = Number($('.pause-aprem-number-1').val());
        const numberOfPersonsDiner1 = Number($('.diner-number-1').val());
        const numberOfPersonsDiner2 = Number($('.diner-number-2').val());
        const numberOfPersonsDiner3 = Number($('.diner-number-3').val());
    
        sumSpecialite1 = calculateCategorySum('checkbox-devis-specialite-1', numberOfPersonsSpecialite1);
        sumSpecialite2 = calculateCategorySum('checkbox-devis-specialite-2', numberOfPersonsSpecialite2);
        sumSpecialite3 = calculateCategorySum('checkbox-devis-specialite-3', numberOfPersonsSpecialite3);
        sumPetitdejeuner1 = calculateCategorySum('checkbox-devis-petitdejeuner-1', numberOfPersonsPetitdejeuner1);
        sumPetitdejeuner2 = calculateCategorySum('checkbox-devis-petitdejeuner-2', numberOfPersonsPetitdejeuner2);
        sumDejeuner1 = calculateCategorySum('checkbox-devis-dejeuner-1', numberOfPersonsDejeuner1);
        sumDejeuner2 = calculateCategorySum('checkbox-devis-dejeuner-2', numberOfPersonsDejeuner2);
        sumDejeuner3 = calculateCategorySum('checkbox-devis-dejeuner-3', numberOfPersonsDejeuner3);
        sumDejeuner4 = calculateCategorySum('checkbox-devis-dejeuner-4', numberOfPersonsDejeuner4);
        sumPause = calculateCategorySum('checkbox-devis-pause', numberOfPersonsPause);
        sumDiner1 = calculateCategorySum('checkbox-devis-diner-1', numberOfPersonsDiner1);
        sumDiner2 = calculateCategorySum('checkbox-devis-diner-2', numberOfPersonsDiner2);
        sumDiner3 = calculateCategorySum('checkbox-devis-diner-3', numberOfPersonsDiner3);
    
        const priceSalleValue = Number($('.price-salle').text().replace(/[^0-9.-]+/g, "").replace(',', '.'));
        const priceTraiteurPersoValue = Number($('.price-traiteur-perso').text().replace(/[^0-9.-]+/g, "").replace(',', '.'));
        const totalCostCateringStaff = Number($('#nombre-equipier-traiteur').text()) * costPerCateringStaff;
        const numberOfSecurityStaff = Number($('#nombre-securite').text());
        const totalCostSecurityStaff = numberOfSecurityStaff * 35; // Assuming $35/hour for security staff
        
        // Assuming similar calculation patterns for other services/items
        sumSpecialite1 = calculateCategorySum('checkbox-devis-specialite-1', Number($('.specialite-number-1').val()));
        sumSpecialite2 = calculateCategorySum('checkbox-devis-specialite-2', Number($('.specialite-number-2').val()));
        sumSpecialite3 = calculateCategorySum('checkbox-devis-specialite-3', Number($('.specialite-number-3').val()));
        sumPetitdejeuner1 = calculateCategorySum('checkbox-devis-petitdejeuner-1', Number($('.petit-dejeuner-number-1').val()));
        sumPetitdejeuner2 = calculateCategorySum('checkbox-devis-petitdejeuner-2', Number($('.petit-dejeuner-number-2').val()));
        sumDejeuner1 = calculateCategorySum('checkbox-devis-dejeuner-1', Number($('.dejeuner-number-1').val()));
        sumDejeuner2 = calculateCategorySum('checkbox-devis-dejeuner-2', Number($('.dejeuner-number-2').val()));
        sumDejeuner3 = calculateCategorySum('checkbox-devis-dejeuner-3', Number($('.dejeuner-number-3').val()));
        sumDejeuner4 = calculateCategorySum('checkbox-devis-dejeuner-4', Number($('.dejeuner-number-4').val()));
        sumPause = calculateCategorySum('checkbox-devis-pause', Number($('.pause-aprem-number-1').val()));
        sumDiner1 = calculateCategorySum('checkbox-devis-diner-1', Number($('.diner-number-1').val()));
        sumDiner2 = calculateCategorySum('checkbox-devis-diner-2', Number($('.diner-number-2').val()));
        sumDiner3 = calculateCategorySum('checkbox-devis-diner-3', Number($('.diner-number-3').val()));
        
        const totalSum = sumSpecialite1 + sumSpecialite2 + sumSpecialite3 + sumPetitdejeuner1 + sumPetitdejeuner2 + sumDejeuner1 + sumDejeuner2 + sumDejeuner3 + sumDejeuner4 + sumPause + sumDiner1 + sumDiner2 + sumDiner3 + priceSalleValue + priceTraiteurPersoValue + totalCostCateringStaff + totalCostSecurityStaff;
        
        const specialTVAValue = (sumSpecialite1 + sumSpecialite2 + sumSpecialite3 + sumPetitdejeuner1 + sumPetitdejeuner2 + sumDejeuner1 + sumDejeuner2 + sumDejeuner3 + sumDejeuner4 + sumPause + sumDiner1 + sumDiner2 + sumDiner3) * 0.1; // Assuming different VAT rate for these categories
        const generalTVA = (priceSalleValue + priceTraiteurPersoValue + totalCostCateringStaff + totalCostSecurityStaff) * 0.2;
        const totalTVA = generalTVA + specialTVAValue;
        
        $('.total-ht').text(totalSum.toFixed(2).replace('.', ',') + '€');
        $('.total-ttc').text((totalSum + totalTVA).toFixed(2).replace('.', ',') + '€');
        $('.price-tva').text(totalTVA.toFixed(2).replace('.', ',') + '€');
        
    };

    function calculateCategorySum(className, numberOfPersons) {
        let sum = 0;
        $(`.${className}`).each(function() {
            const addValue = Number($(this).attr('data-add-value').replace(',', '.'));
            if ($(this).is(':checked')) {
                sum += addValue * numberOfPersons;
            }
        });
        return sum;
    }
    
    function updateSumDisplay(targetClass, sum) {
        $(`.${targetClass}`).text(sum.toFixed(2).replace('.', ',') + '€');
    }
    
    $('.checkbox-devis').change(function() {
        updatePricesAndTotal();
    });
    
    $('.number-input').on('input', function() {
        updatePricesAndTotal();
    });
    
    $('#data-text-item-check').on('input', function() {
        const eventTimeString = $(this).text();
        const numberOfAttendees = parseInt($('#nb-personnes-final-2').val(), 10);
        updateSecurityStaff(eventTimeString, numberOfAttendees);
        updateTeamMembers();
        updatePricesAndTotal();
    });
    
    function resetPricingCalculator() {
        $('.checkbox-devis').prop('checked', false);
        $('.number-input').val('');
        $('#nombre-equipier-traiteur').text('0');
        $('#nombre-securite').text('0');
        $('.total-ht, .total-ttc, .price-tva').text('0,00€');
        initialPriceSalle = Number($('.price-salle').text().replace(/[^0-9.-]+/g, "").replace(',', '.'));
        initialPriceTraiteurPerso = 120;
        $('.price-traiteur-perso').text(initialPriceTraiteurPerso + '€');
        updatePricesAndTotal();
    }
    
    $('.ms-radio-button-tab-is-1, .ms-radio-button-tab-is-2, .ms-radio-button-tab-is-3, .ms-radio-button-tab-is-4, .ms-radio-button-tab-is-5').click(function() {
        costPerCateringStaff = YOUR_DEFAULT_CATERING_STAFF_COST; // Reset to default in case it was set to 0
        let selectedClass = $(this).attr('class').split(' ')[0]; // Assuming the first class denotes the type
        switch(selectedClass) {
            case 'ms-radio-button-tab-is-4':
            case 'ms-radio-button-tab-is-5':
                costPerCateringStaff = 0; // No catering staff needed for these scenarios
                $('#nombre-equipier-traiteur').text('0');
                $('.wrapper-equipier-traiteur').hide();
                break;
            default:
                $('.wrapper-equipier-traiteur').show();
                break;
        }
        updatePricesAndTotal(); // Recalculate prices with the new settings
    });
    
    $('#nombre-equipier-traiteur, #nombre-securite').on('input', function() {
        // This ensures that manual changes to staff numbers also trigger a price update
        updatePricesAndTotal();
    });
    
    function updatePricesAndTotal() {
        // Recalculate everything here, ensure to call this after every change that affects pricing
        const numberOfAttendees = parseInt($('#nb-personnes-final-2').val(), 10) || 0;
        let totalCost = initialPriceSalle + initialPriceTraiteurPerso;
        const cateringStaffCost = $('#nombre-equipier-traiteur').text() * costPerCateringStaff;
        const securityStaffCost = $('#nombre-securite').text() * 35; // Assuming $35/hour for security
        totalCost += cateringStaffCost + securityStaffCost;
    
        // Calculate costs for additional services based on user selections
        // Placeholder for additional costs calculation
    
        // Update VAT and total display
        const totalTVA = totalCost * tvaRate;
        $('.total-ht').text(`${(totalCost).toFixed(2).replace('.', ',')}€`);
        $('.total-ttc').text(`${(totalCost + totalTVA).toFixed(2).replace('.', ',')}€`);
        $('.price-tva').text(`${totalTVA.toFixed(2).replace('.', ',')}€`);
    }
    
    // Assuming there's a function to dynamically update individual service prices
    function updateServicePrice(serviceId, price) {
        $(`#${serviceId}`).text(`${price.toFixed(2).replace('.', ',')}€`);
        updatePricesAndTotal();
    }
    
});
