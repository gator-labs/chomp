Deck and question validation rules:

Validation rules:
Question base:

Question is required and min length is 5 characters
Reveal at date is not required but if entered the format required is DD/MM/YYYY HH:mm
Reveal at answer count is not required but if entered it should be larger then 0
Reveal token amount is not required but if entered it should be larger then 0
Image Url is not required and should be string
Discriminator value is on the field "type", given the type entered is value of "BinaryQuestion" the following validations apply:
Binary left option is required and min length is 1
Binary right option is required and min length is 1
Option true is not required but if entered valid values are 1 or 2 (1 being that left is correct)
Given the type entered is value of "MultiChoice" the following validations apply:
Multi choice option one min length 1
...
Multi choice option four min length 1
Option true is not required but if entered valid values are between 1 and 4 (index based is correct choice, 1 being multi choice option one)
Deck:

Deck is required and min length is 5
Daily date is not required and if entered the format should be "DD/MM/YYYY"
Deck image url is not required and should be string
