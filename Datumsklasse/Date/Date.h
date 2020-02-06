#ifndef CustomDateH
#define CustomDateH

#include <string>

class Date {
 private:
  int day;
  int month;
  int year;
  
  /** 
   * Compares this instance with another.
   *
   * @param rhs The other instance.
   *
   * @return -1 if this instance is smaller, 1 if this is bigger and 0 if equal
   */
  int compare(Date& rhs);

  static const int MaxMonthDays[12];
  
  /**
   * Increments day and automatically increments month and year if necessary
   * 
   * @param amount amount of increments
   */
  void incrementDay(int amount);
  
  /**
   * Increments month and automatically increments year if necessary.
   * It also changes day to max month day, if day is bigger than max month day
   * 
   * @param amount amount of increments
   */
  void incrementMonth(int amount);
  
  /**
   * Increments year
   * 
   * @param amount amount of increments
   */
  void incrementYear(int amount);


 /**
   * decrements day and automatically decrements month and year if necessary
   * 
   * @param amount amount of increments
   */
  void decrementDay(int amount);
  
 /**
   * decrements month and automatically decrements year if necessary.
   * It also changes day to max month day, if day is bigger than max month day
   * 
   * @param amount amount of increments
   */
  void decrementMonth(int amount);
  
  /**
   * decrements year
   * 
   * @param amount amount of decrement
   */
  void decrementYear(int amount);
  
  /**
   * @return max day of current month
   */
  int getMaxDayCurrentMonth();

 public:
  Date(void);
  
  /**
   * This will initialize the instance with the given date 
   *
   * @param day
   * @param month
   * @param year
   */
  Date(int day, int month, int year);
  
  /**
   * Set the date to a given date
   *
   * @param day
   * @param month
   * @param year
   */
  void setDate(int, int, int);
  
  /**
   * @return day of month
   */
  int getDay();
  
  /**
   * @return month
   */
  int getMonth();
  
  /**
   * @return year
   */
  int getYear();
  
  /**
   * @param month
   * @param year
   *
   * @return the last day of the month given in parameter 'month'
   */
  static int getMaxMonthDays(int month, int year);
  
  /**
   * @return a formatted string in (DD.MM.YYYY) format.
   */
  char* toString();

  bool operator==(Date&);
  bool operator!=(Date&);
  bool operator<(Date&);
  bool operator>(Date&);
  bool operator<=(Date&);
  bool operator>=(Date&);
  
  /**
   * manipulation of the date
   * You have access to following units:
   * 'd' => Days
   * 'm' => Months
   * 'w' => Weeks
   * 'y' => Years
   * 
   *
   * @param manipulation Pass the manipulation string: ^([+-]?)([0-9]+)UNIT$
   */
  bool manipulate(std::string manipulation);
};

#endif