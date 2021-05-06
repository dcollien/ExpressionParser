# Language Reference

## +

`(a: Number + b: Number): Number`

Performs addition: a + b

## ADD

`ADD(a: Number, b: Number): Number`

Performs addition: ADD(a, b) = a + b

## *

`(a: Number * b: Number): Number`

Performs multiplication: a * b

## MUL

`MUL(a: Number, b: Number): Number`

Performs multiplication: MUL(a, b) = a * b

## -

`(a: Number - b: Number): Number`

Performs subtraction: a - b

## SUB

`SUB(a: Number, b: Number): Number`

Performs subtraction: SUB(a, b) = a - b

## /

`(a: Number / b: Number): Number`

Performs division: a / b

## DIV

`DIV(a: Number, b: Number): Number`

Performs division: DIV(a, b) = a / b

## ,

`(a , b): Arguments`

Returns an array of arguments with b appended to a. If a is not an argument array, it is automatically appended to an empty array.

## MOD

`MOD(a: Number, b: Number): Number`

Performs modulo operation: MOD(a, b). (equivalent to a % b)

## %

`(a: Number % b: Number): Number`

Performs modulo operation: a % b. (equivalent to MOD(a, b))

## =

`(a = b): Boolean`

Returns TRUE if a = b. Otherwise returns FALSE.

## !=

`(a: Number != b: Number): Number`

Returns FALSE if a = b. Otherwise returns TRUE. (equivalent to <>)

## <>

`(a: Number <> b: Number): Number`

Returns FALSE if a = b. Otherwise returns TRUE. (equivalent to !=)

## ~=

`(a: Number ~= b: Number): Number`

Returns TRUE if ABS(a - b) < EPSILON. Otherwise returns FALSE.

## >

`(a: Number > b: Number): Boolean`

Performs greater-than operation: a > b

## <

`(a: Number < b: Number): Boolean`

Performs less-than operation: a < b

## >=

`(a: Number >= b: Number): Boolean`

Performs greater-than-or-equal operation: a >= b

## <=

`(a: Number <= b: Number): Boolean`

Performs less-than-or-equal operation: a <= b

## AND

`(a: Boolean AND b: Boolean): Boolean`

Performs logical AND: a AND b.

## OR

`(a: Boolean OR b: Boolean): Boolean`

Performs logical OR: a OR b.

## ^

`(a: Number ^ b: Number): Number`

Performs exponentiation (a to the power of b): a ^ b

## NEG

`NEG(value: Number): Number`

Performs negation of the value: NEG(value). (equivalent to -value)

## -

`-(value: Number): Number`

Performs negation of the value: -value. Note: no space can be present before "value". (equivalent to NEG(value))

## ISPRIME

`ISPRIME(value: Number): Number`

Returns TRUE if value is prime, FALSE otherwise.

## GCD

`GCD(a: Number, b: Number): Number`

Returns the greatest common divisor of a and b.

## NOT

`NOT(value: Boolean): Boolean`

Performs logical NOT of the value: NOT(value). (equivalent to !value)

## !

`!(value: Boolean): Boolean`

Performs logical NOT of the value: !value. (equivalent to NOT(value))

## ABS

`ABS(value: Number): Number`

Returns the absolute value of the number: ABS(value).

## ACOS

`ACOS(value: Number): Number`

Returns the arc cosine (inverse cosine) of the number: ACOS(value).

## ACOSH

`ACOSH(value: Number): Number`

Returns the inverse hyperbolic cosine of the number: ACOSH(value).

## ASIN

`ASIN(value: Number): Number`

Returns the arcsine of the number: ASIN(value).

## ASINH

`ASINH(value: Number): Number`

Returns the inverse hyperbolic sine of the number: ASINH(value).

## ATAN

`ATAN(value: Number): Number`

Returns the arctangent of the number: ATAN(value).

## ATAN2

`ATAN2(y: Number, x: Number): Number`

Returns the angle (radians) from the X-axis to a point, given a cartesian y-coordinate and x-coordinate: ATAN2(y, x).

## ATANH

`ATANH(value: Number): Number`

Returns the inverse hyperbolic tangent of the number: ATANH(value).

## CUBEROOT

`CUBEROOT(value: Number): Number`

Returns an approximation of the cubed root of the number: CUBEROOT(value).

## COS

`COS(value: Number): Number`

Returns the cosine of the number: COS(value).

## COSH

`COSH(value: Number): Number`

Returns the hyperbolic cosine of the number: COSH(value).

## EXP

`EXP(value: Number): Number`

Returns the natural logarithm (e) raised to this value: EXP(value).

## LN

`LN(value: Number): Number`

Returns the natural logarithm (base e) of the number: LN(value).

## LOG

`LOG(value: Number): Number`

Returns the base 10 logarithm of the number: LOG(value).

## LOG2

`LOG2(value: Number): Number`

Returns the base 2 logarithm of the number: LOG2(value).

## SIN

`SIN(value: Number): Number`

Returns the sine of the number: SIN(value).

## SINH

`SINH(value: Number): Number`

Returns the hyperbolic sine of the number: SINH(value).

## SQRT

`SQRT(value: Number): Number`

Returns the square root of the number: SQRT(value).

## TAN

`TAN(value: Number): Number`

Returns the tangent of the number: TAN(value).

## TANH

`TANH(value: Number): Number`

Returns the hyperbolic tangent of the number: TANH(value).

## DEGREES

`DEGREES(radians: Number): Number`

Performs a conversion of radians to degrees: DEGREES(radians).

## RADIANS

`RADIANS(degrees: Number): Number`

Performs a conversion of radians to degrees: RADIANS(degrees).

## CEIL

`CEIL(value: Number): Number`

Returns the smallest integer greater-than or equal-to the number: CEIL(value).

## FLOOR

`FLOOR(value: Number): Number`

Returns the greatest integer less-than or equal-to the number: CEIL(value).

## ROUND

`ROUND(value: Number): Number`

Returns the value rounded to the nearest integer: ROUND(value).

## TRUNC

`TRUNC(value: Number): Number`

Returns the integral part of the number, truncating any fractional digits: TRUNC(value).

## SIGN

`SIGN(value: Number): Number`

Returns the sign of the value, indicating whether the number is positive (1) or negative (-1): SIGN(value).

## ISNAN

`ISNAN(value): Boolean`

Returns TRUE if a value is not a number (e.g. the result of an invalid mathematical operation), otherwise returns FALSE: ISNAN(value).

## IF

`IF(condition: Boolean, then, else): result`

Tests the condition and returns the "then" value if the condition is TRUE, otherwise returns the "else" value: IF(condition, then, else).

## AVERAGE

`AVERAGE(values: Array of Numbers): Number`

Returns the average (mean) of an array of numbers. AVERAGE(array).

## SUM

`SUM(values: Array of Numbers): Number`

Returns the sum of an array of numbers. SUM(array).

## MIN

`MIN(values: Array of Numbers): Number`

Returns the minimum value in an array of numbers. MIN(array).

## MAX

`MAX(values: Array of Numbers): Number`

Returns the maximum value in an array of numbers. MAX(array).

## CHAR

`CHAR(code: Integer): String`

Returns a single-character string with a unicode character representing the value of the given code. CHAR(code)

## CODE

`CODE(string: String): Integer`

Returns the unicode value of the first character of a string: CODE(string)

## UPPER

`UPPER(string: String): String`

Converts a string to uppercase: UPPER(string).

## LOWER

`LOWER(string: String): String`

Converts a string to lowercase: LOWER(string).

## DEC2BIN

`DEC2BIN(decimal: Integer): binary: String`

Returns a string of "1" and "0" characters representing the binary representation of the decimal value. DEC2BIN(decimal)

## DEC2HEX

`DEC2HEX(decimal: Integer): hex: String`

Returns a string of characters representing the hexadecimal representation of the decimal value. DEC2HEX(decimal)

## BIN2DEC

`BIN2DEC(binary: String): decimal: Integer`

Returns the base 10 value of a binary string of "1" and "0" characters. BIN2DEC(binary)

## HEX2DEC

`HEX2DEC(hex: String): decimal: Integer`

Returns the base 10 value of a hexadecimal string. HEX2DEC(hex)

## SORT

`SORT(array: Array): Array`

Returns a sorted array: SORT(array).

## REVERSE

`REVERSE(array: Array): Array`

Returns a reversed array: REVERSE(array).

## INDEX

`INDEX(array: Array, i: Integer): Value`

Returns the value at the given array index: INDEX(array, i).

## LENGTH

`LENGTH(array: Array): Integer`

Returns the length of an array: LENGTH(array).

## JOIN

`JOIN(array: Array, separator: String): String`

Joins each array element into a string, using a separator: JOIN(array, separator).

## SPLIT

`SPLIT(string: String, separator: String): Array`

Splits a string into an array of characters, using a separator: SPLIT(string, separator).

## STRING

`STRING(array: Array): String`

Converts an array into a string: STRING(array).

## CHARARRAY

`CHARARRAY(string: String): Array`

Converts a string into an array of characters: CHARARRAY(string)

## ARRAY

`ARRAY(arguments...): Array`

Converts arguments into an array: ARRAY(a, b, c, ...).

## MAP

`MAP(mapper: Reference, array: Array): Array`

Performs a mapper function on each element of the array: MAP(mapper, array).

## REDUCE

`REDUCE(reducer: Reference, start, array: Array): Array`

Performs a reducer function on each pair of array elements, using "start" as its starting value: REDUCE(reducer, array).

## RANGE

`RANGE(start: Integer, limit: Integer): Array`

Creates an array of integers, incrementing from start (included) to the limit (excluded): RANGE(start, limit)

## ZIP

`ZIP(array1: Array, array2: Array): Array of [array1[i], array2[i]]`

Combines two arrays into a single array of both values, paired at their respective position: ZIP(array1, array2)

## UNZIP

`UNZIP(array: Array of [a, b]): [Array of a, Array of b]`

Splits a single array of pairs into two arrays with values at their respective positions: UNZIP(array)

## TAKE

`TAKE(n: Integer): Array`

Takes the first n values from the array: TAKE(n, array)

## DROP

`DROP(n: Integer): Array`

Drops the first n values from the array: DROP(n, array)

## SLICE

`SLICE(startIndex: Integer, limitIndex: Integer): Array`

Slices an array from startIndex to (but not including) limitIndex: SLICE(startIndex, limitIndex, array)

## CONCAT

`CONCAT(array1: Array, array2: Array): Array`

Concatenates two arrays into one: CONCAT(array1, array2)

## HEAD

`HEAD(array: Array): Value`

Retrieves the first element of an array: HEAD(array)

## TAIL

`TAIL(array: Array): Array`

Returns the array without the first element: TAIL(array)

## LAST

`LAST(array: Array): Value`

Retrieves the last element of an array: HEAD(array)

## CONS

`CONS(head: Value, array: Array): Array`

Returns an array with a new value at the first position: CONS(head, array)

## FILTER

`FILTER(filter: Reference, array: Array): Array`

Returns an array of all elements for which 'filter(element)' returns true: FILTER(filter, array).

## TAKEWHILE

`TAKEWHILE(check: Reference, array: Array): Array`

Returns a new array of all elements up until 'check(element)' returns false: TAKEWHILE(check, array).

## DROPWHILE

`DROPWHILE(check: Reference, array: Array): Array`

Returns a new array skipping all elements up until 'check(element)' returns false: DROPWHILE(check, array).

## GET

`GET(key: String, dict: Dictionary): Value`

Retrieves the value of the associated key in a dictionary: GET(key, dict)

## PUT

`PUT(key: String, value: Value, dict: Dictionary): Dictionary`

Returns a dictionary with the key set to a new value: PUT(key, value, dict)

## DICT

`DICT(keys: Array, values: Array): Dictionary`

Constructs a new dictionary out of an array of keys and a corresponding array of values: DICT(keys, values)

## UNZIPDICT

`UNZIPDICT(keyValuePairs: Array): Dictionary`

Constructs a new dictionary out of an array of [key, value] pairs: UNZIPDICT(keyValuePairs)

## KEYS

`KEYS(dict: Dictionary): Array`

Returns all the keys of a dictionary in alphabetical order: KEYS(dict)

## VALUES

`VALUES(dict: Dictionary): Array`

Returns all the values of a dictionary, in alphabetical order of their keys: VALUES(dict)

## [...]

`[arguments...]: Array`

Converts arguments into an array: [a, b, c, ...].
