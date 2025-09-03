-- Create trigger on inventory_transactions to auto-update stock levels
CREATE OR REPLACE TRIGGER inventory_stock_update_trigger
    AFTER INSERT ON public.inventory_transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_inventory_stock();