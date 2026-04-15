/**
 * Timezone utility functions for event app
 * Handles formatting times in different timezones
 */

export const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const formatEventTime = (dateString, timezone = 'UTC') => {
  try {
    const date = new Date(dateString);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    
    const parts = formatter.formatToParts(date);
    const timeString = formatter.format(date);
    const tzAbbr = getTimezoneAbbr(timezone);
    
    return `${timeString} ${tzAbbr}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return new Date(dateString).toLocaleString();
  }
};

export const getTimezoneAbbr = (timezone) => {
  // Create a formatter to get the timezone abbreviation
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short',
  });
  
  const parts = formatter.formatToParts(new Date());
  const tzPart = parts.find(part => part.type === 'timeZoneName');
  
  return tzPart ? tzPart.value : timezone.split('/').pop();
};

export const formatEventTimeShort = (dateString, timezone = 'UTC') => {
  try {
    const date = new Date(dateString);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    
    return formatter.format(date);
  } catch (error) {
    console.error('Error formatting time:', error);
    return new Date(dateString).toLocaleDateString();
  }
};

// Common timezone suggestions
export const COMMON_TIMEZONES = [
  'Africa/Lagos',
  'Africa/Johannesburg',
  'Africa/Cairo',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland',
  'UTC',
];
