#include "Date.h"
#include <ctime>
#include <iostream>
#include <cstdio>
#include <regex>
#include <string>

const int Date::MaxMonthDays[12] = {31, 28, 31, 30, 31, 30,
                                    31, 31, 30, 31, 30, 31};

int Date::compare(Date& o) {
  if (this->getYear() < o.getYear()) {
    return -1;
  } else if (this->getYear() > o.getYear()) {
    return 1;
  }

  if (this->getMonth() < o.getMonth()) {
    return -1;
  } else if (this->getMonth() > o.getMonth()) {
    return 1;
  }

  if (this->getDay() < o.getDay()) {
    return -1;
  } else if (this->getDay() > o.getDay()) {
    return 1;
  }

  return 0;
}

void Date::incrementDay(int amount) {
  while (this->getDay() + amount > this->getMaxDayCurrentMonth()) {
    amount -= this->getMaxDayCurrentMonth() -
              this->getDay() + 1;
    this->day = 1;
    this->incrementMonth(1);
    }

  this->day += amount;
}

void Date::incrementMonth(int amount) {
  int years = amount / 12;
  int months = amount % 12;

  if (years > 0) this->incrementYear(years);

  if (months > 0) {
  	this->month+=months;
  	if(this->month > 12) {
  		this->month-=12;
  		this->incrementYear(1);
	  }
  }

  if (this->getDay() > this->getMaxDayCurrentMonth())
    this->day = this->getMaxDayCurrentMonth();
}

void Date::incrementYear(int amount) {
  this->year += amount;
  if (this->getDay() > this->getMaxDayCurrentMonth())
    this->day =this->getMaxDayCurrentMonth();
}

void Date::decrementDay(int amount) {
  while (this->getDay() - amount < 1) {
    amount -= this->getDay();
    this->decrementMonth(1);
    this->day = this->getMaxDayCurrentMonth();
  }

  this->day -= amount;
}

void Date::decrementMonth(int amount) {
  int years = amount / 12;
  int months = amount % 12;

  if (years > 0) this->decrementYear(years);

  if (months > 0) {
  	this->month-=months;
  		if(this->month < 1) {
  			this->month+=12;
  			this->decrementYear(1);
	  	}
  }

  if (this->getDay() > this->getMaxDayCurrentMonth())
    this->day =this->getMaxDayCurrentMonth();
}

void Date::decrementYear(int amount) {
  this->year -= amount;
  if (this->getDay() > this->getMaxDayCurrentMonth())
    this->day =this->getMaxDayCurrentMonth();
}

Date::Date(void) {
  std::time_t t = std::time(0);
  std::tm* now = std::localtime(&t);
  this->setDate(now->tm_mday, now->tm_mon + 1, now->tm_year + 1900);
}

int Date::getMaxDayCurrentMonth() {
  return Date::getMaxMonthDays(this->getMonth(), this->getYear());
}

Date::Date(int day, int month, int year) { this->setDate(day, month, year); }

void Date::setDate(int day, int month, int year) {
  if (month < 1 || month > 12) {
    throw "Invalid Month";
  }

  if (day < 1 || day > Date::getMaxMonthDays(month, year)) {
    throw "Invalid Day";
  }

  this->day = day;
  this->month = month;
  this->year = year;
}

int Date::getDay() { return this->day; }

int Date::getMonth() { return this->month; }

int Date::getYear() { return this->year; }

int Date::getMaxMonthDays(int month, int year) {
  bool isLeapYear = ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
  return Date::MaxMonthDays[month - 1] + (month == 2 ? (int)isLeapYear : 0);
}

char* Date::toString() {
  char* buff = new char[11];
  std::sprintf(buff, "%02i.%02i.%i", this->day, this->month, this->year);
  return buff;
}

bool Date::operator==(Date& o) { return this->compare(o) == 0; }

bool Date::operator!=(Date& o) { return this->compare(o) != 0; }

bool Date::operator<(Date& o) { return this->compare(o) < 0; }

bool Date::operator>(Date& o) { return this->compare(o) > 0; }

bool Date::operator<=(Date& o) { return this->compare(o) <= 0; }

bool Date::operator>=(Date& o) { return this->compare(o) >= 0; }

bool Date::manipulate(std::string str) {
  const std::regex rgx("^([+-]?)([0-9]+)(d|m|y|w)$");
  std::smatch matches;

  if (!std::regex_search(str, matches, rgx)) {
    return false;
  }

  char sign = matches[1].str()[0] == '-' ? '-' : '+';
  int amount = std::stoi(matches[2].str());
  std::string unit = matches[3].str();

  if (unit.compare("d") == 0) {
    if (sign == '+') {
      this->incrementDay(amount);
    } else {
      this->decrementDay(amount);
    }
  } else if (unit.compare("w") == 0) {
    if (sign == '+') {
      this->incrementDay(amount * 7);
    } else {
      this->decrementDay(amount * 7);
    }
  } else if (unit.compare("m") == 0) {
    if (sign == '+') {
      this->incrementMonth(amount);
    } else {
      this->decrementMonth(amount);
    }
  } else if (unit.compare("y") == 0) {
    if (sign == '+') {
      this->incrementYear(amount);
    } else {
      this->decrementYear(amount);
    }
  }

  return true;
}
