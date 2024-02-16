function updatePricesAndTotal(isRadio4Or5Selected, isRadio1To3Selected) {
    const eventTimeString = $('#data-text-item-check').text();
    const [startTime, endTime] = eventTimeString.split(' au ').map(part => part.split('à')[1].trim());
    const [startHour, startMinute] = startTime.split('h').map(Number);
    const [endHour, endMinute] = endTime.split('h').map(Number);
    let eventStartHour = startHour + startMinute / 60;
    let eventEndHour = endHour + endMinute / 60;

    // Adjust for events ending after midnight
    if (eventEndHour < eventStartHour) {
        eventEndHour += 24;
    }

    // Correcting eventStartHour for calculation if it starts after midnight to ensure proper arrival time calculation
    let adjustedStartHour = eventStartHour;
    if (adjustedStartHour < 6) { // Events starting after midnight but before 6 AM are considered early morning next day
        adjustedStartHour += 24;
    }

    const numberOfCateringStaff = Number($('#nombre-equipier-traiteur').text());
    const numberOfSecurityStaff = Number($('#nombre-securite').text());
    const numberOfRegisseurs = Number($('#nombre-regisseur').text());

    // Calculate security staff arrival and departure times
    let securityArrival;
    if (adjustedStartHour >= 24.5) { // Event starts after midnight
        securityArrival = adjustedStartHour - 0.5;
    } else if (adjustedStartHour >= 18 || eventStartHour < 6) { // Event starts in the evening or early morning
        securityArrival = eventStartHour - 0.5;
    } else { // Default to 17:30 for all other cases
        securityArrival = 17.5;
    }
    if (securityArrival < 0) securityArrival += 24; // Adjust if negative, though unlikely due to above logic
    let securityDeparture = eventEndHour + 0.5;

    // Ensure securityArrival and securityDeparture are within a 24-hour format
    securityArrival = securityArrival % 24;
    securityDeparture = securityDeparture % 24;
    if (securityDeparture <= securityArrival) {
        // This accounts for shifts that end after midnight
        securityDeparture += 24;
    }

    let securityHoursWorked = securityDeparture - securityArrival;
    const securityStaffCost = numberOfSecurityStaff * 35 * securityHoursWorked;

    console.log(`Security Staff: Hours Worked = ${securityHoursWorked}, Cost = ${securityStaffCost.toFixed(2)}€`);
}
