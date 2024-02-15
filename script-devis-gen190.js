$('input[name="Choix-traiteur"]').change(function() {
    let selectedValue = $('input[name="Choix-traiteur"]:checked').val();

    let isRadio4Or5Selected = selectedValue === 'Traiteur personnalisé' || selectedValue === 'Pas de traiteur';
    let isRadio1To3Selected = ['Traiteur n°1', 'Traiteur n°2', 'Traiteur n°3'].includes(selectedValue);

    resetPricingCalculator();
    updatePricesAndTotal(isRadio4Or5Selected, isRadio1To3Selected);
});

function updatePricesAndTotal(isRadio4Or5Selected, isRadio1To3Selected) {
    const eventTimeString = $('#data-text-item-check').text();
    const [startTime, endTime] = eventTimeString.split(' au ').map(part => part.split('à')[1].trim());
    const [startHour, startMinute] = startTime.split('h').map(Number);
    const [endHour, endMinute] = endTime.split('h').map(Number);
    let eventStartHour = startHour + startMinute / 60;
    let eventEndHour = endHour + endMinute / 60;
    if (eventEndHour < eventStartHour) eventEndHour += 24;

    // Define staff counts
    const numberOfCateringStaff = Number($('#nombre-equipier-traiteur').text());
    const numberOfSecurityStaff = Number($('#nombre-securite').text());
    const numberOfRegisseurs = Number($('#nombre-regisseur').text());

    // Security staff timing
    let securityArrival = eventStartHour < 18 ? 17.5 : eventStartHour - 0.5;
    let securityDeparture = eventEndHour + 0.5;

    // Catering and Regisseur staff timing for Scenario 1 and 2
    let cateringArrival = isRadio1To3Selected ? eventStartHour - 2 : null;
    let cateringDeparture = isRadio1To3Selected ? eventEndHour + 1 : null;
    let regisseurArrival = isRadio1To3Selected ? eventStartHour - 2 : eventStartHour - 1;
    let regisseurDeparture = eventEndHour + 1;

    // Assuming default staff cost values
    const YOUR_DEFAULT_CATERING_STAFF_COST = 30; // Placeholder
    const securityStaffCost = numberOfSecurityStaff * 35 * (securityDeparture - securityArrival);
    const regisseurCost = numberOfRegisseurs * 40 * (regisseurDeparture - regisseurArrival);
    const cateringStaffCost = isRadio1To3Selected ? numberOfCateringStaff * YOUR_DEFAULT_CATERING_STAFF_COST * (cateringDeparture - cateringArrival) : 0;


    const totalStaffCost = cateringStaffCost + securityStaffCost + regisseurCost;
    console.log(`Total Staff Cost: ${totalStaffCost}`);
    
    // Update staff presence messages directly
    $('#temps-staff-securite').text(`Le staff sécurité arrivera à ${formatTime(securityArrival)} et partira à ${formatTime(securityDeparture)}. Pour un total de ${securityStaffCost.toFixed(2)}€.`);
    $('#temps-staff-traiteur').text(isRadio1To3Selected ? `Le staff traiteur arrivera à ${formatTime(cateringArrival)} et partira à ${formatTime(cateringDeparture)}. Pour un total de ${cateringStaffCost.toFixed(2)}€.` : "");
    $('#temps-regisseur').text(`Le staff régisseur arrivera à ${formatTime(regisseurArrival)} et partira à ${formatTime(regisseurDeparture)}. Pour un total de ${regisseurCost.toFixed(2)}€.`);

    $('#total-staff').text((cateringStaffCost + securityStaffCost + regisseurCost).toFixed(2).replace('.', ','));
