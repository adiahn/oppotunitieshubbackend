/**
 * Generates initials from a name
 * @param {string} name - Full name of the user
 * @returns {string} - Initials (maximum 2 characters)
 */
const generateInitials = (name) => {
    if (!name) return 'U'; // Default to 'U' for unknown/undefined names
    
    // Split the name into parts and get initials
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
        // If single name, return first two characters or first character capitalized
        return (nameParts[0].substring(0, 2) || 'U').toUpperCase();
    }
    
    // Get first character of first and last name
    const firstInitial = nameParts[0][0];
    const lastInitial = nameParts[nameParts.length - 1][0];
    return (firstInitial + lastInitial).toUpperCase();
};

/**
 * Generates a consistent background color based on initials
 * @param {string} initials - User initials
 * @returns {string} - Background color in hex
 */
const generateBackgroundColor = (initials) => {
    // Predefined colors for better visual appeal
    const colors = [
        '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
        '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
        '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#f39c12',
        '#d35400', '#c0392b', '#7f8c8d'
    ];
    
    // Generate a consistent index based on initials
    const charCodes = initials.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorIndex = charCodes % colors.length;
    
    return colors[colorIndex];
};

/**
 * Generates avatar data for a user
 * @param {string} name - User's full name
 * @returns {Object} Avatar data including initials and background color
 */
const generateAvatarData = (name) => {
    const initials = generateInitials(name);
    const backgroundColor = generateBackgroundColor(initials);
    
    return {
        initials,
        backgroundColor
    };
};

module.exports = {
    generateAvatarData
}; 