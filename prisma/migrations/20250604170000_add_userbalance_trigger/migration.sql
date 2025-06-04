CREATE OR REPLACE FUNCTION sync_user_balance()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO "UserBalance" ("userId", asset, balance)
    VALUES (NEW."userId", NEW.asset, NEW.change)
    ON CONFLICT ("userId", asset)
    DO UPDATE SET balance = "UserBalance".balance + EXCLUDED.balance;

  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE "UserBalance"
    SET balance = balance - OLD.change
    WHERE "userId" = OLD."userId" AND asset = OLD.asset;

  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD."userId" = NEW."userId" AND OLD.asset = NEW.asset) THEN
      -- Straight update to FATL entry: need to sync the net change
      UPDATE "UserBalance"
      SET balance = balance + (NEW.change - OLD.change)
      WHERE "userId" = NEW."userId" AND asset = NEW.asset;
    ELSE
      -- FATL entry userId or asset changing: both records
      -- must be updated in this case
      UPDATE "UserBalance"
      SET balance = balance - OLD.change
      WHERE "userId" = OLD."userId" AND asset = OLD.asset;

      INSERT INTO "UserBalance" ("userId", asset, balance)
      VALUES (NEW."userId", NEW.asset, NEW.change)
      ON CONFLICT ("userId", asset)
      DO UPDATE SET balance = "UserBalance".balance + EXCLUDED.balance;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_user_balance
AFTER INSERT OR UPDATE OR DELETE ON "FungibleAssetTransactionLog"
FOR EACH ROW EXECUTE FUNCTION sync_user_balance();
