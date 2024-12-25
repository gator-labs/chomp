ALTER TABLE "ChompResult" 
ADD CONSTRAINT "burnTransactionSignature_not_empty" 
CHECK ("burnTransactionSignature" IS NULL OR (LENGTH("burnTransactionSignature") > 85 AND LENGTH("burnTransactionSignature") < 89));