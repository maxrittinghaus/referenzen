#define CATCH_CONFIG_MAIN
#include "catch.hpp"
#include "../Date/Date.h"
#include <ctime>
#include <iostream>
#include <string.h>

void invalidTest(int d, int m, int y) {
  REQUIRE_THROWS([&]() { new Date(d, m, y); }());
}

void testCondition(bool condition) { REQUIRE(condition); }

void manipulateTest(std::string s, std::string result, int d, int m, int y) {
  Date* t = new Date(d, m, y);
  INFO(s);
  t->manipulate(s);
  INFO(t->toString());
  REQUIRE(result.compare(t->toString()) == 0);
}

void manipulateTest(std::string s, std::string result) {
  manipulateTest(s, result, 31, 1, 2000);
}

TEST_CASE("Date Class", "[Date]") {
  SECTION("Create instance without parameter") {
    Date* d = new Date();
    std::time_t t = std::time(0);
    std::tm* now = std::localtime(&t);

    REQUIRE(d->getDay() == now->tm_mday);
    REQUIRE(d->getMonth() == now->tm_mon + 1);
    REQUIRE(d->getYear() == now->tm_year + 1900);
  }

  SECTION("Create instance with parameter") {  // In this constructor the
                                               // SetDate Method gets called so
                                               // it would be the same result
                                               // for setDate Testings
    Date* d = new Date(23, 2, 1999);

    REQUIRE(d->getDay() == 23);
    REQUIRE(d->getMonth() == 2);
    REQUIRE(d->getYear() == 1999);
  }

  SECTION("Create instance with invalid dates") {  // In this constructor the
                                                   // SetDate Method gets called
                                                   // so it would be the same
                                                   // result for setDate
                                                   // Testings
    invalidTest(29, 2, 2001);
    invalidTest(30, 2, 2004);
    invalidTest(32, 1, 1234);
    invalidTest(-5, 2, 2004);
    invalidTest(1, 13, 2004);
    invalidTest(31, 4, 2004);
  }

  SECTION("Date::toString()") {
    REQUIRE(strcmp((new Date(10, 10, 2000))->toString(), "10.10.2000") == 0);
    REQUIRE(strcmp((new Date(1, 1, 1970))->toString(), "01.01.1970") == 0);
  }

  SECTION("Conditional Operator") {
    testCondition(*(new Date(10, 10, 1999)) < *(new Date(10, 10, 2000)));
    testCondition(*(new Date(10, 9, 2000)) < *(new Date(10, 10, 2000)));
    testCondition(*(new Date(9, 10, 2000)) < *(new Date(10, 10, 2000)));

    testCondition(*(new Date(10, 10, 1999)) <= *(new Date(10, 10, 2000)));
    testCondition(*(new Date(10, 9, 2000)) <= *(new Date(10, 10, 2000)));
    testCondition(*(new Date(9, 10, 2000)) <= *(new Date(10, 10, 2000)));
    testCondition(*(new Date(10, 10, 2000)) <= *(new Date(10, 10, 2000)));

    testCondition(*(new Date(10, 10, 2001)) > *(new Date(10, 10, 2000)));
    testCondition(*(new Date(10, 11, 2000)) > *(new Date(10, 10, 2000)));
    testCondition(*(new Date(11, 10, 2000)) > *(new Date(10, 10, 2000)));

    testCondition(*(new Date(10, 10, 2001)) >= *(new Date(10, 10, 2000)));
    testCondition(*(new Date(10, 11, 2000)) >= *(new Date(10, 10, 2000)));
    testCondition(*(new Date(11, 10, 2000)) >= *(new Date(10, 10, 2000)));
    testCondition(*(new Date(10, 10, 2000)) >= *(new Date(10, 10, 2000)));

    testCondition(*(new Date(10, 10, 2000)) == *(new Date(10, 10, 2000)));
    testCondition(*(new Date(10, 10, 2001)) != *(new Date(10, 10, 2000)));
  }

  SECTION("Date::manipulate()") {
    manipulateTest("+1d", "01.02.2000");
    manipulateTest("1d", "01.02.2000");
    manipulateTest("-1d", "30.01.2000");
    manipulateTest("-31d", "31.12.1999");
    manipulateTest("+31d", "02.03.2000");
    manipulateTest("+1m", "29.02.2000");
    manipulateTest("-1m", "31.12.1999");
    manipulateTest("7w", "20.03.2000");
    manipulateTest("-7w", "13.12.1999");
    manipulateTest("17w", "29.05.2000");
    manipulateTest("-17w", "04.10.1999");
    manipulateTest("-1y", "28.02.1999", 29, 2, 2000);
    manipulateTest("+1y", "28.02.2001", 29, 2, 2000);
  }
}

