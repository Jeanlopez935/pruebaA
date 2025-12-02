import requests
from bs4 import BeautifulSoup
import urllib3

# Disable SSL warnings as BCV certs are often problematic
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def get_bcv_rate():
    """
    Fetches the current USD exchange rate from the BCV website.
    Returns the rate as a float, or None if fetching fails.
    """
    url = "https://www.bcv.org.ve"
    try:
        # Use verify=False because BCV often has SSL issues
        response = requests.get(url, verify=False, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # The structure usually involves a div with id="dolar"
        # Inside it, there's usually a strong tag or similar with the rate
        dolar_div = soup.find('div', id='dolar')
        
        if dolar_div:
            # Look for the rate text
            rate_text = dolar_div.find('strong').get_text().strip()
            # Format: "36,1234" -> "36.1234"
            rate_text = rate_text.replace(',', '.')
            return float(rate_text)
            
        return None
        
    except Exception as e:
        print(f"Error fetching BCV rate: {e}")
        return None
