ALTER TABLE "MysteryBoxAllowlist" 
ADD CONSTRAINT "address_length_check" 
CHECK (char_length(address) >= 32 AND char_length(address) <= 44);