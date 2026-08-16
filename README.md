KONCEPTUALNI MODEL UPRAVLJANJA I ZAŠTITE BIOMETRIJSKIH PODATAKA RADI UNAPREĐENJA SAJBER BEZBEDNOSTI
Opis projekta

Predmet rada sastoji se u projektovanju, prikazivanju i primeni modela za unapređenje sajber bezbednosti pomoću zaštite i upravljanja biometrijskim podacima. Predloženi naziv modela je Okvir životnog ciklusa biometrijskih podataka. Primarna zamisao jeste da se model koristi u različitim oblastima, ali za potrebe ovog master rada biće urađena simulacija na primeru digitalnih finansijskih sistema. Konkretno, simulacija je urađena na tri primera: 

Scenario 1 – uspešno izvršenje finansijske transakcije;

Scenario 2 – pokušaj prevare prilikom izvršenja finansijske transakcije;

Scenario 3 – zatvaranje korisničkog računa.

Cilj istraživanja obuhvata projektovanje i primenu višeslojnog modela upravljanja i zaštite biometrijskih podataka koji doprinosi unapređenju sajber bezbednosti.

Naučni i praktični doprinos ogleda se u projektovanju modela i njegovoj primeni na konkretnom primeru. Naravno, projektovanje i primena modela obavlja se kroz simulaciju i ne podrazumeva stvarnu realizaciju kompletnog finansijskog sistema. Implementacija i simulacija izvršene su u lokalnom Windows okruženju.



Tehnologije
Git Bash
Visual Studio Code
Node.js
JavaScript
Git i GitHub
Docker
Hyperledger Fabric


Simulacija scenarija
Scenario 1 – uspešna transakcija

Simulira se uspešna finansijska transakcija ovlašćenog korisnika.

Biometrijski obrazac odgovara registrovanom hash-u, zbog čega se transakcija odobrava.

Rezultat: ALLOW

Scenario 2 – pokušaj prevare

Simulira se pokušaj finansijske transakcije sa neusklađenim biometrijskim obrascem.

Blockchain aplikacija detektuje neusaglašenost i evidentira bezbednosni događaj.

Rezultat: DENY

Status: SUSPICIOUS ACTIVITY DETECTED

Scenario 3 – zatvaranje računa

Simulira se zatvaranje računa korisnika.

U okviru procesa zatvaranja računa briše se povezani biometrijski zapis. Nakon brisanja generiše se kriptografska potvrda, dok se zapis o izvršenom procesu evidentira na blokčejn-u.

Rezultat: DELETED


Implementirane funkcionalnosti

Pametni ugovor biometric.js implementira:

registraciju biometrijskog zapisa;
čitanje biometrijskog zapisa;
proveru postojanja zapisa;
obradu finansijske transakcije uz biometrijsku verifikaciju;
evidentiranje sumnjivih bezbednosnih događaja;
čitanje bezbednosnih događaja;
čitanje finansijskih transakcija;
brisanje biometrijskog zapisa;
evidentiranje potvrde o izvršenom brisanju.

Napomena

Projekat predstavlja simulaciju primene predloženog modela. Korišćene biometrijske vrednosti su simulirani podaci i ne predstavljaju stvarne biometrijske karakteristike korisnika.

Autor
Milica Radišić