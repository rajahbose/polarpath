/**
 * SolarCalc - High-precision solar position and trajectory calculation module.
 * Based on NOAA Solar Calculator & Spencer / Meeus astronomical algorithms.
 */

export class SolarCalc {
    static DEG2RAD = Math.PI / 180;
    static RAD2DEG = 180 / Math.PI;

    /**
     * Get day of year from date (1 - 366)
     */
    static getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    /**
     * Calculate Solar Declination (in radians)
     * Spencer (1971) formula
     */
    static getSolarDeclination(dayOfYear) {
        const gamma = (2 * Math.PI / 365) * (dayOfYear - 1);
        const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
            - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma)
            - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);
        return decl; // radians
    }

    /**
     * Calculate Equation of Time in minutes
     */
    static getEquationOfTime(dayOfYear) {
        const gamma = (2 * Math.PI / 365) * (dayOfYear - 1);
        const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
            - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
        return eqtime; // minutes
    }

    /**
     * Calculate True Solar Time (in hours, 0 to 24)
     * @param {Date} date
     * @param {number} longitude (in degrees, East positive)
     */
    static getSolarTime(date, longitude) {
        const dayOfYear = this.getDayOfYear(date);
        const eot = this.getEquationOfTime(dayOfYear);
        const timeZoneOffsetHours = -date.getTimezoneOffset() / 60; // Local timezone offset in hours
        const localStandardMeridian = timeZoneOffsetHours * 15;
        const timeOffset = eot + 4 * (longitude - localStandardMeridian); // in minutes
        
        const localHours = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
        let solarHours = localHours + timeOffset / 60;
        
        solarHours = (solarHours + 24) % 24;
        return solarHours;
    }

    /**
     * Compute exact solar position (Elevation and Azimuth)
     * @param {Date} date 
     * @param {number} latitude (degrees, North positive)
     * @param {number} longitude (degrees, East positive)
     * @returns {{ elevation: number, azimuth: number, zenith: number, declination: number, isDaylight: boolean, solarTime: number }} in degrees
     */
    static getSolarPosition(date, latitude, longitude) {
        const dayOfYear = this.getDayOfYear(date);
        const decl = this.getSolarDeclination(dayOfYear); // radians
        const latRad = latitude * this.DEG2RAD;
        
        const solarTime = this.getSolarTime(date, longitude);
        // Hour angle (H): 0 at solar noon, negative in morning (-15 deg/hr), positive in afternoon
        const hourAngleRad = (solarTime - 12) * 15 * this.DEG2RAD;

        // Solar Elevation (Altitude): sin(alpha) = sin(lat)*sin(decl) + cos(lat)*cos(decl)*cos(H)
        const sinElevation = Math.sin(latRad) * Math.sin(decl) + Math.cos(latRad) * Math.cos(decl) * Math.cos(hourAngleRad);
        const elevationRad = Math.asin(Math.max(-1, Math.min(1, sinElevation)));
        const elevationDeg = elevationRad * this.RAD2DEG;

        // Solar Azimuth: angle measured from True North clockwise (0 = N, 90 = E, 180 = S, 270 = W)
        // Using standard NOAA solar azimuth formula:
        const cosEl = Math.max(0.0001, Math.cos(elevationRad));
        const cosZenithAngle = (Math.sin(latRad) * Math.sin(elevationRad) - Math.sin(decl)) / (Math.cos(latRad) * cosEl);
        const gammaRad = Math.acos(Math.max(-1, Math.min(1, cosZenithAngle)));
        const gammaDeg = gammaRad * this.RAD2DEG;

        let azimuthDeg;
        if (hourAngleRad > 0) {
            azimuthDeg = (gammaDeg + 180) % 360;
        } else {
            azimuthDeg = (540 - gammaDeg) % 360;
        }

        return {
            elevation: elevationDeg,
            azimuth: azimuthDeg,
            zenith: 90 - elevationDeg,
            declination: decl * this.RAD2DEG,
            solarTime: solarTime,
            isDaylight: elevationDeg > -0.833 // standard atmospheric refraction threshold for sunrise/sunset
        };
    }

    /**
     * Compute Sunrise, Sunset, and Solar Noon for a given date and location
     */
    static getSolarTimes(date, latitude, longitude) {
        const dayOfYear = this.getDayOfYear(date);
        const decl = this.getSolarDeclination(dayOfYear);
        const latRad = latitude * this.DEG2RAD;
        
        // Zenith threshold for sunrise/sunset: 90.833 degrees
        const cosH0 = (Math.cos(90.833 * this.DEG2RAD) - Math.sin(latRad) * Math.sin(decl)) / (Math.cos(latRad) * Math.cos(decl));
        
        if (cosH0 > 1) {
            // Polar night (sun never rises)
            return { hasSunrise: false, hasSunset: false, isPolarNight: true, isMidnightSun: false, sunrise: null, sunset: null, dayLength: 0 };
        } else if (cosH0 < -1) {
            // Midnight sun (sun never sets)
            return { hasSunrise: false, hasSunset: false, isPolarNight: false, isMidnightSun: true, sunrise: null, sunset: null, dayLength: 24 };
        }

        const H0 = Math.acos(cosH0) * this.RAD2DEG; // degrees
        const halfDayHours = H0 / 15; // hours

        const eot = this.getEquationOfTime(dayOfYear);
        const tzOffset = -date.getTimezoneOffset() / 60;
        const localStandardMeridian = tzOffset * 15;
        const solarNoonOffset = (localStandardMeridian - longitude) * 4 - eot; // in minutes
        const solarNoonHours = 12 + solarNoonOffset / 60;

        const sunriseHours = solarNoonHours - halfDayHours;
        const sunsetHours = solarNoonHours + halfDayHours;

        return {
            hasSunrise: true,
            hasSunset: true,
            isPolarNight: false,
            isMidnightSun: false,
            solarNoon: solarNoonHours,
            sunrise: sunriseHours,
            sunset: sunsetHours,
            dayLength: halfDayHours * 2
        };
    }

    /**
     * Generate daily solar trajectory path points across 24 hours for a given date
     */
    static getDailyPath(date, latitude, longitude, stepMinutes = 5) {
        const points = [];
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        for (let m = 0; m <= 24 * 60; m += stepMinutes) {
            const h = Math.floor(m / 60);
            const min = m % 60;
            const testDate = new Date(year, month, day, h, min, 0);
            const pos = this.getSolarPosition(testDate, latitude, longitude);
            
            points.push({
                timeMinutes: m,
                timeHours: m / 60,
                elevation: pos.elevation,
                azimuth: pos.azimuth,
                isDaylight: pos.isDaylight
            });
        }
        return points;
    }

    /**
     * Generate representative key dates for polar sun chart:
     * - Jun 21 (Summer Solstice in Northern)
     * - May 21 / Jul 21
     * - Apr 21 / Aug 21
     * - Mar 21 / Sep 21 (Equinox)
     * - Feb 21 / Oct 21
     * - Jan 21 / Nov 21
     * - Dec 21 (Winter Solstice in Northern)
     */
    static getKeySolarPaths(year, latitude, longitude) {
        const keyDates = [
            { name: 'Jun 21 (Summer Solstice)', date: new Date(year, 5, 21), color: '#ffcc00', isSolstice: true, highlight: 'summer' },
            { name: 'May 21 / Jul 21', date: new Date(year, 4, 21), color: '#ffa834', isSolstice: false },
            { name: 'Apr 21 / Aug 21', date: new Date(year, 3, 21), color: '#ff7744', isSolstice: false },
            { name: 'Mar 21 / Sep 21 (Equinox)', date: new Date(year, 2, 21), color: '#00e5a3', isEquinox: true },
            { name: 'Feb 21 / Oct 21', date: new Date(year, 1, 21), color: '#00b4d8', isSolstice: false },
            { name: 'Jan 21 / Nov 21', date: new Date(year, 0, 21), color: '#4361ee', isSolstice: false },
            { name: 'Dec 21 (Winter Solstice)', date: new Date(year, 11, 21), color: '#7209b7', isSolstice: true, highlight: 'winter' }
        ];

        return keyDates.map(item => ({
            ...item,
            points: this.getDailyPath(item.date, latitude, longitude, 4)
        }));
    }

    /**
     * Generate Analemma (hour curves across the 12 months for every whole hour)
     */
    static getHourCurves(year, latitude, longitude, startHour = 5, endHour = 19) {
        const curves = [];
        for (let hour = startHour; hour <= endHour; hour++) {
            const points = [];
            // Sample every 2 days across the year to create smooth analemma loops
            for (let dayOfYear = 1; dayOfYear <= 366; dayOfYear += 2) {
                const date = new Date(year, 0, dayOfYear, hour, 0, 0);
                const pos = this.getSolarPosition(date, latitude, longitude);
                if (pos.elevation >= 0) { // strictly above horizon only
                    points.push({
                        dayOfYear,
                        elevation: pos.elevation,
                        azimuth: pos.azimuth,
                        isDaylight: true
                    });
                }
            }
            if (points.length >= 4) {
                const isClosed = points[0].dayOfYear <= 5 && points[points.length - 1].dayOfYear >= 360;
                curves.push({
                    hour: hour,
                    label: `${hour % 12 === 0 ? 12 : hour % 12} ${hour >= 12 ? 'PM' : 'AM'}`,
                    points: points,
                    isClosedLoop: isClosed
                });
            }
        }
        return curves;
    }
}
