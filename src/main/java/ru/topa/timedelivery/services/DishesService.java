package ru.topa.timedelivery.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.topa.timedelivery.entities.catalog.Dishes;
import ru.topa.timedelivery.entities.catalog.TypeDishes;
import ru.topa.timedelivery.repositories.DishesRepository;

import java.util.Arrays;
import java.util.List;

@Service
public class DishesService {

    @Autowired
    DishesRepository dishesRepository;

    public void addAllDishes() {
        List<Dishes> dishesList = Arrays.asList(
                new Dishes("Четыре сезона", 680.0, 390, "/pizza/4 sezona.jpg", "Куриное филе, бекон, ветчина, охотничьи колбаски, помидор, сыр моцарелла, соус томатный.", false, false, false, false, TypeDishes.PIZZA),
                new Dishes("Четыре Сыра", 680.0, 350, "/pizza/4 sira.jpg", "Сыр дор-блю, сыр пармезан, сыр моцарелла, сыр чизбургер, соус томатный", false, false, false, true, TypeDishes.PIZZA),
                new Dishes("BBQ", 795.0, 440, "/pizza/BBQ.jpg", "Охотничьи колбаски, соус BBQ, грибы шампиньоны, помидор, сыр моцарелла, соус томатный", false, false, false, false, TypeDishes.PIZZA),
                new Dishes("BIF", 830.0, 380, "/pizza/BIF.jpg", "Говяжья вырезка, огурцы маринованные, лук криспи, сыр моцарелла, соус перечный.", false, true, false, false, TypeDishes.PIZZA),
                new Dishes("Калипсо", 810.0, 370, "/pizza/Calipso.jpg", "Филе лосося, соус сливочный, помидор черри, сыр моцарелла, укроп, соус маминори с добавлением чили.", false, true, false, true, TypeDishes.PIZZA),
                new Dishes("Мексиканская", 650.0, 440, "/pizza/Mexican.jpg", "Куриное филе, помидор, грибы шампиньоны, болгарский перец, сыр моцарелла, перец острый халапеньо, соус томатный.", false, true, false, false, TypeDishes.PIZZA),
                new Dishes("MIX", 680.0, 420, "/pizza/MIX.jpg", "Куриное филе, ветчина, бекон, салями, сыр моцарелла, помидор, сырный соус, соус томатный", false, false, true, false, TypeDishes.PIZZA),

                new Dishes("Аляска",460.0,215,"/rolls/Alaska.jpg","Рис, нори, кунжут, сыр творожный, омлет томаго, соус спайс, икра тобика.",false, false, false, true,TypeDishes.ROLLS),
                new Dishes("BBQ-roll",395.0,330,"/rolls/BBQ.jpg","Бекон, сыр творожный, помидоры, соус BBQ, лук зеленый, темпура, рис, нори.",false, false, false, false,TypeDishes.ROLLS),
                new Dishes("Филадельфия",640.0,250,"/rolls/Fila.jpg","Лосось, сыр Филадельфия, огурец, рис, нори.",false, false, true, false,TypeDishes.ROLLS),
                new Dishes("Хот",530.0,280,"/rolls/Hot.jpg","Сыр сливочный, томаго омлет, кунжут, соус Сэнсэй, сыр моцарелла, рис, нори.",false, false, true, false,TypeDishes.ROLLS),
                new Dishes("Сэнпай",550.0,300,"/rolls/Sempai.jpg","Сливочный сыр, икра масаго, мука темпура, рис, нори.",false, false, false, false,TypeDishes.ROLLS),
                new Dishes("Вулкан",570.0,250,"/rolls/Vylkan.jpg","Тартар из тунца, соус спайси острый, сыр сливочный, помидор, томаго омлет, кунжут, рис, нори.",false, true, false, false,TypeDishes.ROLLS),
                new Dishes("Яцуми",420.0,225,"/rolls/Yacymo.jpg","Сыр сливочный, сыр Чизбургер, огурец, кунжут, рис, нори, перечный соус.",true, true, false, true,TypeDishes.ROLLS),

                new Dishes("Гюдон",640.0,280,"/wok/Gydon.jpg","Говядина, шампиньоны, лук ялтинский, лайм, соус черный перец, рис, желток, зелень, кунжут.",false, false, false, true,TypeDishes.WOK),
                new Dishes("Курица Мияги",450.0,300,"/wok/miyagi.jpg","Нежнейшее филе курицы в сочетании с рисом и томленой стручковой фасолью и добавлением острого Тайского соуса Ким-чи с ялтинским луком и грибами.",false, true, false, false,TypeDishes.WOK),
                new Dishes("Говядина По",680.0,320,"/wok/po.jpg","Нежнейшее филе телятины с лапшой соба , под сырно-сливочным соусом Дор-блю с помидором,зеленым луком.",false, false, false, false,TypeDishes.WOK),
                new Dishes("Сливочный Удон с курицей",570.0,400,"/wok/Slivochniy udon.jpg","Лапша удон с маринованным куриным филе под фирменным сливочным соусом , шампиньонами, репчатым луком и икрой масаго.",false, false, true, false,TypeDishes.WOK),
                new Dishes("Соба с лососем",695.0,410,"/wok/Soba.jpg","Гречневая лапша, лосось, грибы, лук ялтинский, перец болгарский, помидор черри, имбирь.",false, false, false, false,TypeDishes.WOK),
                new Dishes("Жаренный рис Том-Ям",595.0,350,"/wok/Tom-Yam.jpg","Креветка тигровая, куриное филе, рис, корень имбиря, молоко кокосовое, лук зеленый, имбирь, чеснок, кунжут, лайм.",false, false, true, false,TypeDishes.WOK),

                new Dishes("Салат Цезарь с курицей",570.0,240,"/salad/cezar.jpg","Микс салат с куриным филе, пармезаном, перепелиным яйцом, беконом, хрустящими гренками под фирменным соусом, со сладкими помидорами черри.",false, false, true, false,TypeDishes.SALAD),
                new Dishes("Салат с креветками манго-чили",680.0,200,"/salad/chili-mango.jpg","Креветки тигровые, микс салата, помидоры черри, сыр Креметта, сочный апельсин под фирменным соусом манго-чили.",false, false, false, false,TypeDishes.SALAD),
                new Dishes("Салат Греческий",530.0,260,"/salad/grecheskiy.jpg","Помидоры розовые, помидоры черри, перец болгарский, огурец, ялтинский лук, маслины, оливки, сыр фета. Заправка из  оливкового масла со специями.",true, false, false, false,TypeDishes.SALAD),
                new Dishes("Салат Хияши Вакаме",420.0,150,"/salad/hiyshi.jpg","Водоросли Чука, кунжут, соус Гамадари.",true, false, false, false,TypeDishes.SALAD),
                new Dishes("Салат Теплый с морепродуктами",640.0,220,"/salad/tepliy.jpg","Тигровая креветка, новозеландская мидия и кальмар под соусом Тартар в сочетании с миксом салата и помидорами черри.",false, false, true, false,TypeDishes.SALAD),

                new Dishes("Бургер Блю-чиз",640.0,250,"/burgers/blu.jpg","Картофельная булочка, сыр чеддер, салат микс соус дор-блю, маринованные корнишоны, котлета из мраморной говядины.",false, false, false, true,TypeDishes.BURGER),
                new Dishes("Бургер Брусничный",595.0,235,"/burgers/brust.jpg","Картофельная булочка, сыр креметта, котлета из мраморной говядины, соус Брусничный, корнишоны маринованные.",false, false, false, false,TypeDishes.BURGER),
                new Dishes("Бургер Детский",420.0,340,"/burgers/children.jpg","Картофельная булочка, свежий огурец, куриная котлета, сыр Чеддер, соус Чили-майонез, подаётся с картофелем фри и кетчупом. Декор из сыра Моцарелла и маслин.",false, false, true, false,TypeDishes.BURGER),
                new Dishes("Чизбургер",595.0,250,"/burgers/chiz.jpg","Картофельная булочка, сыр чеддер, микс салата, соус перечный, маринованные корнишоны, котлета из мраморной говядины.",false, false, true, false,TypeDishes.BURGER),
                new Dishes("Чикенбургер",530.0,280,"/burgers/chiken.jpg","Картофельная булочка, салат айсберг, куриная котлета, сыр чеддер, соус перечный, свежий помидор и корнишоны.",false, false, false, false,TypeDishes.BURGER),
                new Dishes("Фишбургер",620.0,240,"/burgers/fish.jpg","Картофельная булочка, соус тар-тар, микс салата, свежий огурец, лук ялтинский, лосось охлажденный",false, false, false, true,TypeDishes.BURGER)
        );

        dishesRepository.saveAll(dishesList);
    }

}
