const DateTimeFormatter = require('../DateTimeFormatter');

describe('DateTimeFormatter interface', () => {
  it('should throw error when invoke abstract behavior', () => {
    // Arrange
    const dateTimeFormatter = new DateTimeFormatter();

    // Action & Assert
    expect(() => dateTimeFormatter.formatDateTime('dummy_date_time')).toThrowError('DATE_TIME_FORMATTER.METHOD_NOT_IMPLEMENTED');
  });
});