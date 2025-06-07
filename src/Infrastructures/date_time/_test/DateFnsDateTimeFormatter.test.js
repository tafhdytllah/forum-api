const LuxonDateTimeFormatter = require('../LuxonDateTimeFormatter');
const { DateTime } = require('luxon');

describe('LuxonDateTimeFormatterHelper', () => {
  describe('formatDateTime function', () => {
    it('should format the date correctly using given timezone and format', () => {
      // Arrange
      const mockDate = new Date('2023-12-31T15:00:00Z'); // 15:00 UTC
      const expectedFormatted = '2023-12-31T22:00:00+07:00'; // waktu Jakarta

      // Buat instance dengan fungsi asli
      const formatter = new LuxonDateTimeFormatter(DateTime);

      // Act
      const result = formatter.formatDateTime(mockDate);

      // Assert
      expect(result).toBe(expectedFormatted);
    });
  });
});
