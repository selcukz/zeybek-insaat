/**
 * Zeybek İnşaat — site içeriği.
 *
 * TEMSİLİ VERİDİR. Proje adları, adresler, tarihler, yüzdeler ve iletişim
 * bilgileri örnektir. Gerçek bilgiler geldiğinde yalnızca bu dosya değişir;
 * hiçbir bileşen metni içermez.
 */

export type ProjectStatus = "devam" | "tamamlandi" | "yeni";

export type Block = {
  ad: string;
  bodrum: number;
  katlar: number;
  /** Kaba inşaatın ulaştığı kat. 0 = temel seviyesi. */
  tamamlananKat: number;
  /** Devam eden kattaki ilerleme, 0–100. */
  aktifKatYuzde: number;
  bagimsizBolum: number;
};

export type Project = {
  slug: string;
  ad: string;
  ilce: string;
  mahalle: string;
  durum: ProjectStatus;
  gorsel: string;
  /** Kart ve hero için kısa satır. */
  slogan: string;
  ozet: string;
  aciklama: string[];
  kunye: { etiket: string; deger: string }[];
  ozellikler: { ikon: FeatureIcon; ad: string }[];
  konum: { ikon: LocationIcon; ad: string; dakika: number }[];
  bloklar: Block[];
  /** Disiplin bazında fiziksel gerçekleşme, 0–100. */
  imalat: { ad: string; yuzde: number }[];
  genelYuzde: number;
  sozlesmeTeslim: string;
  sonGuncelleme: string;
  /** Proje sayfasında gösterilen görseller: render ve tamamlanmış yapı. */
  gorseller: string[];
  /** İnşaat takibi sayfasında gösterilen saha fotoğrafları. */
  saha: string[];
  ilerlemeNotu: string[];
};

export type FeatureIcon =
  | "deprem"
  | "otopark"
  | "peyzaj"
  | "asansor"
  | "jenerator"
  | "guvenlik"
  | "isi"
  | "cocuk";

export type LocationIcon =
  | "metro"
  | "hastane"
  | "okul"
  | "carsi"
  | "sahil"
  | "yol";

/* ------------------------------------------------------------------ */
/*  Projeler                                                           */
/* ------------------------------------------------------------------ */

export const projeler: Project[] = [
  {
    slug: "zeybek-meydan",
    ad: "Zeybek Meydan",
    ilce: "Kadıköy",
    mahalle: "Fikirtepe",
    durum: "devam",
    gorsel: "/gorseller/proje-fikirtepe.jpg",
    slogan: "Aynı sokakta, yeni bir ev",
    ozet:
      "Fikirtepe'de yedi parselin birleşmesiyle kurulan iki blokluk yerinde dönüşüm projesi. Hak sahiplerinin tamamı aynı ada içinde kalıyor.",
    aciklama: [
      "Zeybek Meydan, yedi ayrı parselde yer alan ve 2023 yılında riskli yapı tespiti yapılan on iki binanın, kat maliklerinin 2/3 çoğunluk kararıyla tek bir ada altında birleştirilmesiyle kuruldu. Proje, hak sahiplerinin mahallelerinden ayrılmadan yeni konutlarına geçmesi esasına göre kurgulandı.",
      "İki blok, aralarında ortak bir meydan bırakacak şekilde konumlandırıldı. Zemin kat ticari birimler mahalle esnafına tahsis edildi; üst katlar 2+1 ve 3+1 tiplerinden oluşuyor. Tüm bağımsız bölümler 2018 Türkiye Bina Deprem Yönetmeliği'ne göre, süneklik düzeyi yüksek perde-çerçeve sistemiyle projelendirildi.",
      "Otopark, sığınak ve teknik hacimler üç bodrum katta çözüldü. Böylece zemin kotu tamamen yayaya ve peyzaja bırakıldı.",
    ],
    kunye: [
      { etiket: "Ada / Parsel", deger: "3142 / 7" },
      { etiket: "Arsa Alanı", deger: "6.480 m²" },
      { etiket: "Toplam İnşaat Alanı", deger: "31.200 m²" },
      { etiket: "Bağımsız Bölüm", deger: "148 konut · 12 ticari" },
      { etiket: "Yapı Ruhsatı", deger: "14 Mart 2025" },
      { etiket: "Sözleşmesel Teslim", deger: "30 Eylül 2027" },
    ],
    ozellikler: [
      { ikon: "deprem", ad: "2018 Deprem Yönetmeliği" },
      { ikon: "otopark", ad: "3 Kat Bodrum Otopark" },
      { ikon: "peyzaj", ad: "Ortak Meydan ve Peyzaj" },
      { ikon: "asansor", ad: "Blok Başına İki Asansör" },
      { ikon: "jenerator", ad: "Tam Kapasite Jeneratör" },
      { ikon: "guvenlik", ad: "24 Saat Güvenlik" },
      { ikon: "isi", ad: "Merkezi Isı Pompası" },
      { ikon: "cocuk", ad: "Çocuk Oyun Alanı" },
    ],
    konum: [
      { ikon: "metro", ad: "Fikirtepe Metro İstasyonu", dakika: 4 },
      { ikon: "hastane", ad: "Göztepe Şehir Hastanesi", dakika: 9 },
      { ikon: "okul", ad: "Kadıköy Anadolu Lisesi", dakika: 12 },
      { ikon: "carsi", ad: "Bağdat Caddesi", dakika: 14 },
      { ikon: "yol", ad: "D-100 Bağlantısı", dakika: 3 },
      { ikon: "sahil", ad: "Caddebostan Sahili", dakika: 16 },
    ],
    bloklar: [
      {
        ad: "A Blok",
        bodrum: 3,
        katlar: 14,
        tamamlananKat: 9,
        aktifKatYuzde: 45,
        bagimsizBolum: 84,
      },
      {
        ad: "B Blok",
        bodrum: 3,
        katlar: 14,
        tamamlananKat: 7,
        aktifKatYuzde: 70,
        bagimsizBolum: 76,
      },
    ],
    imalat: [
      { ad: "Hafriyat ve İksa", yuzde: 100 },
      { ad: "Temel ve Bodrum", yuzde: 100 },
      { ad: "Kaba İnşaat", yuzde: 58 },
      { ad: "Cephe", yuzde: 12 },
      { ad: "Mekanik ve Elektrik", yuzde: 24 },
      { ad: "İnce İşler", yuzde: 6 },
    ],
    genelYuzde: 61,
    sozlesmeTeslim: "2027-09-30",
    sonGuncelleme: "2026-07-31",
    gorseller: [
      "/gorseller/proje-fikirtepe.jpg",
      "/gorseller/ic-mekan.jpg",
      "/gorseller/avlu.jpg",
    ],
    saha: [
      "/gorseller/santiye-kaba.jpg",
      "/gorseller/santiye-donati.jpg",
      "/gorseller/santiye-iskele.jpg",
      "/gorseller/santiye-ic.jpg",
    ],
    ilerlemeNotu: [
      "Temmuz ayı içinde A Blok'ta 9. kat döşeme betonu tamamlandı, 10. kat kalıp imalatına başlandı. B Blok'ta 8. kat perde donatısı bağlanıyor.",
      "Cephe mantolama imalatına A Blok kuzey cephesinde başlandı. Mekanik şaft borulamaları bodrum katlardan yukarı doğru ilerliyor.",
      "Önümüzdeki çeyrekte her iki blokta kaba inşaatın son katlara ulaşması, A Blok'ta ise cephe kaplamasının yarısının bitirilmesi planlanıyor.",
    ],
  },
  {
    slug: "zeybek-bahce",
    ad: "Zeybek Bahçe",
    ilce: "Bahçelievler",
    mahalle: "Şirinevler",
    durum: "devam",
    gorsel: "/gorseller/proje-bahcelievler.jpg",
    slogan: "Bahçesi olan bir apartman",
    ozet:
      "Tek parselde, bahçesini koruyarak yenilenen beş katlı aile apartmanı. Teslime altı ay kaldı.",
    aciklama: [
      "Zeybek Bahçe, 1987 yapımı bir apartmanın yerinde dönüşümüdür. Kat malikleri, mevcut bahçenin ve olgun ağaçların korunması şartıyla sözleşmeye taraf oldu; yeni yapı, ağaç dokusunu bozmayacak biçimde parselin kuzeyine çekildi.",
      "Beş normal kat ve iki bodrumdan oluşan yapıda her katta iki daire bulunuyor. Eski binada 3+1 olan daireler, aynı brüt alanda daha verimli bir planla yeniden düzenlendi.",
    ],
    kunye: [
      { etiket: "Ada / Parsel", deger: "812 / 14" },
      { etiket: "Arsa Alanı", deger: "980 m²" },
      { etiket: "Toplam İnşaat Alanı", deger: "3.150 m²" },
      { etiket: "Bağımsız Bölüm", deger: "10 konut" },
      { etiket: "Yapı Ruhsatı", deger: "8 Şubat 2024" },
      { etiket: "Sözleşmesel Teslim", deger: "28 Şubat 2027" },
    ],
    ozellikler: [
      { ikon: "deprem", ad: "2018 Deprem Yönetmeliği" },
      { ikon: "peyzaj", ad: "Korunan Bahçe Dokusu" },
      { ikon: "otopark", ad: "Kapalı Otopark" },
      { ikon: "asansor", ad: "Sedye Asansörü" },
      { ikon: "isi", ad: "Doğalgaz Kombi" },
      { ikon: "cocuk", ad: "Bahçe Oyun Alanı" },
    ],
    konum: [
      { ikon: "metro", ad: "Şirinevler Metro İstasyonu", dakika: 6 },
      { ikon: "hastane", ad: "Bahçelievler Devlet Hastanesi", dakika: 7 },
      { ikon: "okul", ad: "Şirinevler İlkokulu", dakika: 3 },
      { ikon: "carsi", ad: "Metroport", dakika: 8 },
      { ikon: "yol", ad: "E-5 Bağlantısı", dakika: 4 },
    ],
    bloklar: [
      {
        ad: "Tek Blok",
        bodrum: 2,
        katlar: 5,
        tamamlananKat: 5,
        aktifKatYuzde: 100,
        bagimsizBolum: 10,
      },
    ],
    imalat: [
      { ad: "Hafriyat ve İksa", yuzde: 100 },
      { ad: "Temel ve Bodrum", yuzde: 100 },
      { ad: "Kaba İnşaat", yuzde: 100 },
      { ad: "Cephe", yuzde: 92 },
      { ad: "Mekanik ve Elektrik", yuzde: 78 },
      { ad: "İnce İşler", yuzde: 61 },
    ],
    genelYuzde: 86,
    sozlesmeTeslim: "2027-02-28",
    sonGuncelleme: "2026-07-31",
    gorseller: [
      "/gorseller/proje-bahcelievler.jpg",
      "/gorseller/ic-mekan.jpg",
      "/gorseller/avlu.jpg",
    ],
    saha: [
      "/gorseller/santiye-cephe.jpg",
      "/gorseller/santiye-ic.jpg",
      "/gorseller/santiye-iskele.jpg",
    ],
    ilerlemeNotu: [
      "Kaba inşaat ve çatı imalatı tamamlandı. Cephe mantolaması ve dış boya son katta devam ediyor.",
      "Daire içi alçı sıva bitti; şap imalatı 3. kata kadar ulaştı. Mutfak ve banyo seramikleri ilk iki katta uygulanıyor.",
      "Yapı kullanma izni başvurusunun 2026 yılı son çeyreğinde yapılması, teslimin sözleşme tarihinden önce gerçekleşmesi öngörülüyor.",
    ],
  },
  {
    slug: "zeybek-kisikli",
    ad: "Zeybek Kısıklı",
    ilce: "Üsküdar",
    mahalle: "Kısıklı",
    durum: "devam",
    gorsel: "/gorseller/proje-uskudar.jpg",
    slogan: "Yamaca yerleşen teraslar",
    ozet:
      "Eğimli araziye kademelenen, her dairesi teraslı sekiz katlı yapı. Kaba inşaat yeni başladı.",
    aciklama: [
      "Kısıklı'nın dik yamacında yer alan parselde, mevcut yapının riskli çıkması üzerine kat malikleriyle kat karşılığı sözleşme imzalandı. Arazinin doğal eğimi düzleştirilmek yerine tasarıma dahil edildi.",
      "Her kat bir öncekinden geri çekilerek, alttaki dairenin çatısını üsttekinin terası haline getiriyor. Böylece sekiz bağımsız bölümün tamamı Boğaz yönüne açık bir dış mekâna sahip oluyor.",
    ],
    kunye: [
      { etiket: "Ada / Parsel", deger: "1206 / 3" },
      { etiket: "Arsa Alanı", deger: "1.340 m²" },
      { etiket: "Toplam İnşaat Alanı", deger: "4.820 m²" },
      { etiket: "Bağımsız Bölüm", deger: "16 konut" },
      { etiket: "Yapı Ruhsatı", deger: "22 Ekim 2025" },
      { etiket: "Sözleşmesel Teslim", deger: "31 Aralık 2028" },
    ],
    ozellikler: [
      { ikon: "deprem", ad: "2018 Deprem Yönetmeliği" },
      { ikon: "peyzaj", ad: "Her Dairede Teras" },
      { ikon: "otopark", ad: "Kademeli Bodrum Otopark" },
      { ikon: "asansor", ad: "Panoramik Asansör" },
      { ikon: "guvenlik", ad: "Kapalı Site Güvenliği" },
      { ikon: "isi", ad: "Yerden Isıtma" },
    ],
    konum: [
      { ikon: "metro", ad: "Kısıklı Metro İstasyonu", dakika: 5 },
      { ikon: "hastane", ad: "Acıbadem Altunizade", dakika: 8 },
      { ikon: "okul", ad: "Üsküdar Amerikan Lisesi", dakika: 11 },
      { ikon: "carsi", ad: "Capitol", dakika: 7 },
      { ikon: "yol", ad: "15 Temmuz Şehitler Köprüsü", dakika: 10 },
    ],
    bloklar: [
      {
        ad: "Tek Blok",
        bodrum: 2,
        katlar: 8,
        tamamlananKat: 2,
        aktifKatYuzde: 30,
        bagimsizBolum: 16,
      },
    ],
    imalat: [
      { ad: "Hafriyat ve İksa", yuzde: 100 },
      { ad: "Temel ve Bodrum", yuzde: 88 },
      { ad: "Kaba İnşaat", yuzde: 22 },
      { ad: "Cephe", yuzde: 0 },
      { ad: "Mekanik ve Elektrik", yuzde: 8 },
      { ad: "İnce İşler", yuzde: 0 },
    ],
    genelYuzde: 27,
    sozlesmeTeslim: "2028-12-31",
    sonGuncelleme: "2026-07-31",
    gorseller: [
      "/gorseller/proje-uskudar.jpg",
      "/gorseller/avlu.jpg",
    ],
    saha: [
      "/gorseller/santiye-donati.jpg",
      "/gorseller/santiye-kaba.jpg",
    ],
    ilerlemeNotu: [
      "Kademeli temel imalatı üst kotta tamamlandı, alt kotta son iki aks devam ediyor. İksa perdelerinde ölçüm sonuçları öngörülen sınırların içinde.",
      "2. kat perde ve kolon betonu döküldü; 3. kat kalıp imalatına ağustos ayında başlanacak.",
      "Kaba inşaatın 2027 ilk yarısında son kata ulaşması hedefleniyor.",
    ],
  },
  {
    slug: "zeybek-bahariye",
    ad: "Zeybek Bahariye",
    ilce: "Kadıköy",
    mahalle: "Caferağa",
    durum: "tamamlandi",
    gorsel: "/gorseller/proje-kadikoy.jpg",
    slogan: "Teslim edildi — 2024",
    ozet:
      "Bahariye'de zemin katı esnafa açık, altı katlı karma yapı. 2024'te anahtar teslimi yapıldı.",
    aciklama: [
      "Zeybek Bahariye, firmanın Kadıköy'deki ilk yerinde dönüşüm projesidir. Zemin katta yer alan üç dükkân, yıkımdan önce aynı adreste faaliyet gösteren esnafa tahsis edildi.",
      "Yapı, Ağustos 2024'te yapı kullanma izni alınarak kat maliklerine teslim edildi. Teslim, sözleşmede öngörülen tarihten kırk gün önce gerçekleşti.",
    ],
    kunye: [
      { etiket: "Ada / Parsel", deger: "445 / 22" },
      { etiket: "Arsa Alanı", deger: "720 m²" },
      { etiket: "Toplam İnşaat Alanı", deger: "3.640 m²" },
      { etiket: "Bağımsız Bölüm", deger: "12 konut · 3 ticari" },
      { etiket: "Yapı Kullanma İzni", deger: "19 Ağustos 2024" },
      { etiket: "Teslim", deger: "2 Eylül 2024" },
    ],
    ozellikler: [
      { ikon: "deprem", ad: "2018 Deprem Yönetmeliği" },
      { ikon: "otopark", ad: "Kapalı Otopark" },
      { ikon: "asansor", ad: "Sedye Asansörü" },
      { ikon: "isi", ad: "Merkezi Sistem" },
      { ikon: "guvenlik", ad: "Görüntülü Diafon" },
      { ikon: "peyzaj", ad: "Çatı Terası" },
    ],
    konum: [
      { ikon: "metro", ad: "Kadıköy Metro İstasyonu", dakika: 6 },
      { ikon: "sahil", ad: "Kadıköy İskele", dakika: 8 },
      { ikon: "hastane", ad: "Kadıköy Devlet Hastanesi", dakika: 10 },
      { ikon: "okul", ad: "Caferağa İlkokulu", dakika: 4 },
      { ikon: "carsi", ad: "Bahariye Caddesi", dakika: 1 },
    ],
    bloklar: [
      {
        ad: "Tek Blok",
        bodrum: 2,
        katlar: 6,
        tamamlananKat: 6,
        aktifKatYuzde: 100,
        bagimsizBolum: 15,
      },
    ],
    imalat: [
      { ad: "Hafriyat ve İksa", yuzde: 100 },
      { ad: "Temel ve Bodrum", yuzde: 100 },
      { ad: "Kaba İnşaat", yuzde: 100 },
      { ad: "Cephe", yuzde: 100 },
      { ad: "Mekanik ve Elektrik", yuzde: 100 },
      { ad: "İnce İşler", yuzde: 100 },
    ],
    genelYuzde: 100,
    sozlesmeTeslim: "2024-09-02",
    sonGuncelleme: "2024-09-02",
    gorseller: [
      "/gorseller/proje-kadikoy.jpg",
      "/gorseller/ic-mekan.jpg",
      "/gorseller/avlu.jpg",
    ],
    saha: [
      "/gorseller/proje-kadikoy.jpg",
      "/gorseller/avlu.jpg",
      "/gorseller/ic-mekan.jpg",
    ],
    ilerlemeNotu: [
      "Proje tamamlanmış, yapı kullanma izni alınmış ve tüm bağımsız bölümler kat maliklerine teslim edilmiştir.",
      "Kat irtifakı, teslimi takip eden ay içinde kat mülkiyetine çevrilmiştir.",
    ],
  },
  {
    slug: "zeybek-bati",
    ad: "Zeybek Batı",
    ilce: "Ataşehir",
    mahalle: "Barbaros",
    durum: "yeni",
    gorsel: "/gorseller/proje-atasehir.jpg",
    slogan: "Muvafakat süreci başladı",
    ozet:
      "Ataşehir'de dokuz katlı, iki cepheli parsel. Kat malikleri toplantısı tamamlandı, sözleşme aşamasında.",
    aciklama: [
      "Barbaros Mahallesi'ndeki parselde riskli yapı tespiti Mayıs 2026'da tamamlandı ve tapuya şerh işlendi. İtiraz süresi itirazsız kapandı.",
      "Kat malikleri toplantısında 2/3 arsa payı çoğunluğu sağlandı. Kat karşılığı inşaat sözleşmesinin noterde imzalanması ve kira yardımı başvurularının başlatılması için hazırlıklar sürüyor.",
    ],
    kunye: [
      { etiket: "Ada / Parsel", deger: "2287 / 9" },
      { etiket: "Arsa Alanı", deger: "1.860 m²" },
      { etiket: "Öngörülen İnşaat Alanı", deger: "8.400 m²" },
      { etiket: "Öngörülen Bağımsız Bölüm", deger: "34 konut" },
      { etiket: "Riskli Yapı Tespiti", deger: "11 Mayıs 2026" },
      { etiket: "Aşama", deger: "Sözleşme ve muvafakat" },
    ],
    ozellikler: [
      { ikon: "deprem", ad: "2018 Deprem Yönetmeliği" },
      { ikon: "otopark", ad: "İki Kat Bodrum Otopark" },
      { ikon: "peyzaj", ad: "Ortak Bahçe" },
      { ikon: "asansor", ad: "İki Asansör" },
      { ikon: "jenerator", ad: "Jeneratör" },
      { ikon: "guvenlik", ad: "24 Saat Güvenlik" },
    ],
    konum: [
      { ikon: "metro", ad: "Ataşehir Metro İstasyonu", dakika: 7 },
      { ikon: "hastane", ad: "Ataşehir Şehir Hastanesi", dakika: 12 },
      { ikon: "okul", ad: "Barbaros Anadolu Lisesi", dakika: 6 },
      { ikon: "carsi", ad: "Watergarden", dakika: 9 },
      { ikon: "yol", ad: "TEM Bağlantısı", dakika: 5 },
    ],
    bloklar: [
      {
        ad: "Tek Blok",
        bodrum: 2,
        katlar: 9,
        tamamlananKat: 0,
        aktifKatYuzde: 0,
        bagimsizBolum: 34,
      },
    ],
    imalat: [
      { ad: "Hafriyat ve İksa", yuzde: 0 },
      { ad: "Temel ve Bodrum", yuzde: 0 },
      { ad: "Kaba İnşaat", yuzde: 0 },
      { ad: "Cephe", yuzde: 0 },
      { ad: "Mekanik ve Elektrik", yuzde: 0 },
      { ad: "İnce İşler", yuzde: 0 },
    ],
    genelYuzde: 0,
    sozlesmeTeslim: "2029-06-30",
    sonGuncelleme: "2026-07-31",
    gorseller: ["/gorseller/proje-atasehir.jpg"],
    saha: [],
    ilerlemeNotu: [
      "Proje henüz inşaat aşamasında değildir. Sözleşme ve muvafakat süreci tamamlandığında yıkım ruhsatı başvurusu yapılacaktır.",
    ],
  },
  {
    slug: "zeybek-sahil",
    ad: "Zeybek Sahil",
    ilce: "Maltepe",
    mahalle: "Cevizli",
    durum: "yeni",
    gorsel: "/gorseller/proje-maltepe.jpg",
    slogan: "Riskli yapı tespiti tamamlandı",
    ozet:
      "Marmara'ya bakan parselde altı katlı yenileme. Kat malikleri toplantısı eylül ayında.",
    aciklama: [
      "Cevizli'de sahil yoluna yakın parselde yer alan 1991 yapımı bina, Bakanlık lisanslı kuruluşça yapılan tespit sonucunda riskli yapı olarak belirlendi.",
      "Yeni yapı, tüm dairelerin balkonlarının denize yönelmesini sağlayacak biçimde konumlandırıldı. Kat malikleri toplantısı Eylül 2026'da yapılacak.",
    ],
    kunye: [
      { etiket: "Ada / Parsel", deger: "9034 / 5" },
      { etiket: "Arsa Alanı", deger: "1.120 m²" },
      { etiket: "Öngörülen İnşaat Alanı", deger: "4.100 m²" },
      { etiket: "Öngörülen Bağımsız Bölüm", deger: "18 konut" },
      { etiket: "Riskli Yapı Tespiti", deger: "27 Haziran 2026" },
      { etiket: "Aşama", deger: "Kat malikleri toplantısı" },
    ],
    ozellikler: [
      { ikon: "deprem", ad: "2018 Deprem Yönetmeliği" },
      { ikon: "peyzaj", ad: "Deniz Manzaralı Balkon" },
      { ikon: "otopark", ad: "Kapalı Otopark" },
      { ikon: "asansor", ad: "Sedye Asansörü" },
      { ikon: "isi", ad: "Isı Pompası" },
      { ikon: "cocuk", ad: "Çocuk Oyun Alanı" },
    ],
    konum: [
      { ikon: "sahil", ad: "Maltepe Sahil Parkı", dakika: 4 },
      { ikon: "metro", ad: "Cevizli Metro İstasyonu", dakika: 8 },
      { ikon: "hastane", ad: "Maltepe Devlet Hastanesi", dakika: 9 },
      { ikon: "okul", ad: "Cevizli Ortaokulu", dakika: 5 },
      { ikon: "yol", ad: "D-100 Bağlantısı", dakika: 3 },
    ],
    bloklar: [
      {
        ad: "Tek Blok",
        bodrum: 2,
        katlar: 6,
        tamamlananKat: 0,
        aktifKatYuzde: 0,
        bagimsizBolum: 18,
      },
    ],
    imalat: [
      { ad: "Hafriyat ve İksa", yuzde: 0 },
      { ad: "Temel ve Bodrum", yuzde: 0 },
      { ad: "Kaba İnşaat", yuzde: 0 },
      { ad: "Cephe", yuzde: 0 },
      { ad: "Mekanik ve Elektrik", yuzde: 0 },
      { ad: "İnce İşler", yuzde: 0 },
    ],
    genelYuzde: 0,
    sozlesmeTeslim: "2029-03-31",
    sonGuncelleme: "2026-07-31",
    gorseller: ["/gorseller/proje-maltepe.jpg"],
    saha: [],
    ilerlemeNotu: [
      "Proje henüz inşaat aşamasında değildir. Kat malikleri toplantısının ardından süreç sözleşme aşamasına geçecektir.",
    ],
  },
];

export const projeBul = (slug: string) =>
  projeler.find((p) => p.slug === slug);

export const devamEdenler = projeler.filter((p) => p.durum === "devam");
export const yeniBaslayanlar = projeler.filter((p) => p.durum === "yeni");

export const durumEtiketi: Record<ProjectStatus, string> = {
  devam: "Devam ediyor",
  tamamlandi: "Teslim edildi",
  yeni: "Yeni başlıyor",
};

/* ------------------------------------------------------------------ */
/*  Kentsel dönüşüm süreci — 6306 sayılı Kanun sırası                  */
/* ------------------------------------------------------------------ */

export const surec = [
  {
    ad: "Keşif",
    dayanak: "Ücretsiz",
    sure: "1 hafta",
    metin:
      "Binanızı yerinde inceliyoruz. Yapım yılı, taşıyıcı sistem, kat adedi ve arsa payı üzerinden ön değerlendirme raporunu ücretsiz veriyoruz.",
  },
  {
    ad: "Riskli Yapı Tespiti",
    dayanak: "6306 s.k. m.3",
    sure: "4 hafta",
    metin:
      "Bakanlık lisanslı kuruluş binadan karot alarak tespiti yapar. Rapor olumluysa tapuya şerh işlenir ve maliklere tebligat gider; 15 gün itiraz süresi başlar.",
  },
  {
    ad: "Kat Malikleri Kararı",
    dayanak: "6306 s.k. m.6",
    sure: "6 hafta",
    metin:
      "Arsa payının 2/3'ünü oluşturan maliklerin kararıyla dönüşüme geçilir. Kat karşılığı inşaat sözleşmesi ve muvafakatnameler noterde imzalanır.",
  },
  {
    ad: "Tahliye ve Yıkım",
    dayanak: "18 ay kira yardımı",
    sure: "8 hafta",
    metin:
      "Kira yardımı başvurularını sizin adınıza takip ediyoruz. Tahliyenin ardından yıkım ruhsatı alınır ve bina kontrollü biçimde yıkılır.",
  },
  {
    ad: "İnşaat",
    dayanak: "Yapı ruhsatı",
    sure: "18–24 ay",
    metin:
      "Temel, kaba inşaat, cephe, mekanik ve elektrik, ince işler. Her ayın sonunda fiziksel gerçekleşme yüzdesi ve saha fotoğrafları portala yüklenir.",
  },
  {
    ad: "Teslim",
    dayanak: "Yapı kullanma izni",
    sure: "6 hafta",
    metin:
      "İskân alınır, kat irtifakı kat mülkiyetine çevrilir ve anahtarlar teslim edilir. Teslimden sonra iki yıl imalat garantisi devam eder.",
  },
];

/* ------------------------------------------------------------------ */
/*  Kurum bilgileri                                                    */
/* ------------------------------------------------------------------ */

export const kurum = {
  ad: "Zeybek İnşaat",
  kurulus: 2009,
  telefon: "0850 840 00 00",
  telefonHref: "tel:+908508400000",
  eposta: "bilgi@zeybekinsaat.com.tr",
  adres: "Barbaros Mah. Begonya Sok. No: 12, 34746 Ataşehir / İstanbul",
  rakamlar: [
    { deger: "17", etiket: "Yılda tamamlanan dönüşüm" },
    { deger: "1.240", etiket: "Teslim edilen bağımsız bölüm" },
    { deger: "9", etiket: "İlçede aktif proje" },
    { deger: "0", etiket: "Teslimi geciken proje" },
  ],
};

export const sikSorulanlar = [
  {
    soru: "Dönüşüm sürecinde nerede oturacağım?",
    cevap:
      "Tahliyeden itibaren 18 ay boyunca Çevre, Şehircilik ve İklim Değişikliği Bakanlığı kira yardımından yararlanırsınız. Başvuru dosyanızı biz hazırlar, ödemeleri portaldan takip edebilirsiniz.",
  },
  {
    soru: "Bütün komşuların imzası gerekli mi?",
    cevap:
      "Hayır. 6306 sayılı Kanun'un 6. maddesi uyarınca arsa payının 2/3'ünü oluşturan maliklerin kararı yeterlidir. Katılmayan maliklerin payı için kanunda öngörülen yol izlenir.",
  },
  {
    soru: "Dairem küçülür mü?",
    cevap:
      "Sözleşmede her malikin alacağı bağımsız bölümün brüt alanı, katı ve cephesi tek tek yazılır. İmar hakkı elverdiği ölçüde eşit veya daha büyük alan hedeflenir; küçülme söz konusuysa sözleşmede bedeli belirtilir.",
  },
  {
    soru: "İnşaat gecikirse ne oluyor?",
    cevap:
      "Sözleşmede teslim tarihi ve gecikme halinde uygulanacak günlük gecikme tazminatı açıkça yer alır. Fiziksel gerçekleşme her ay portala işlendiği için gecikme riski erken görülür.",
  },
  {
    soru: "Binamın riskli olup olmadığını nasıl öğrenirim?",
    cevap:
      "Ücretsiz keşif talebi bırakın; binanızı yerinde inceleyip ön değerlendirme raporunu verelim. Resmî tespit yalnızca Bakanlık lisanslı kuruluşlarca yapılabilir, yönlendirmesini biz yaparız.",
  },
];

/* ------------------------------------------------------------------ */
/*  Footer site haritası                                               */
/* ------------------------------------------------------------------ */

export const siteHaritasi: { baslik: string; baglantilar: { ad: string; href: string }[] }[] = [
  {
    baslik: "Projeler",
    baglantilar: projeler.map((p) => ({
      ad: p.ad,
      href: `/projeler/${p.slug}`,
    })),
  },
  {
    baslik: "İnşaat Takibi",
    baglantilar: [
      ...projeler
        .filter((p) => p.durum !== "yeni")
        .map((p) => ({ ad: p.ad, href: `/insaat-takibi/${p.slug}` })),
      { ad: "Tüm projeler", href: "/insaat-takibi" },
    ],
  },
  {
    baslik: "Kentsel Dönüşüm",
    baglantilar: [
      { ad: "Süreç nasıl işler", href: "/#surec" },
      { ad: "6306 sayılı Kanun", href: "/#surec" },
      { ad: "Riskli yapı tespiti", href: "/#surec" },
      { ad: "Kat karşılığı sözleşme", href: "/#surec" },
      { ad: "Kira yardımı", href: "/#surec" },
      { ad: "Sıkça sorulan sorular", href: "/#sorular" },
    ],
  },
  {
    baslik: "Kurumsal",
    baglantilar: [
      { ad: "Hakkımızda", href: "/#kurumsal" },
      { ad: "Referanslar", href: "/#kurumsal" },
      { ad: "Kalite ve iş güvenliği", href: "/#kurumsal" },
      { ad: "Basın", href: "/#kurumsal" },
      { ad: "Kariyer", href: "/#kurumsal" },
    ],
  },
  {
    baslik: "Hak Sahibi",
    baglantilar: [
      { ad: "Portal girişi", href: "/#portal" },
      { ad: "Sözleşmem", href: "/#portal" },
      { ad: "Kira yardımı takibi", href: "/#portal" },
      { ad: "Teslim takvimi", href: "/#portal" },
      { ad: "Destek talebi", href: "/#iletisim" },
    ],
  },
  {
    baslik: "Diğer",
    baglantilar: [
      { ad: "İletişim", href: "/#iletisim" },
      { ad: "KVKK aydınlatma metni", href: "/#iletisim" },
      { ad: "Çerez politikası", href: "/#iletisim" },
      { ad: "Bilgi toplumu hizmetleri", href: "/#iletisim" },
    ],
  },
];
