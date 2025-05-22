package ru.topa.timedelivery.services;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ru.topa.timedelivery.DTOs.DishesDTO;
import ru.topa.timedelivery.entities.catalog.DeletedDishes;
import ru.topa.timedelivery.entities.catalog.Dishes;
import ru.topa.timedelivery.entities.catalog.Type;
import ru.topa.timedelivery.entities.catalog.TypeDishes;
import ru.topa.timedelivery.repositories.DeletedDishesRepository;
import ru.topa.timedelivery.repositories.DishesRepository;
import ru.topa.timedelivery.repositories.TypeDishesRepository;
import ru.topa.timedelivery.repositories.TypeRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DishesService {

    @Autowired
    DishesRepository dishesRepository;
    @Autowired
    TypeDishesRepository typeDishesRepository;
    @Autowired
    TypeRepository typeRepository;
    @Autowired
    FileStorageService fileStorageService;
    @Autowired
    DeletedDishesRepository deletedDishesRepository;

    public DishesDTO createDish(String name, double price, int weight, String ingredient,
                                Long categoryId, Long typeId, MultipartFile imageFile) {

        String imageUrl = fileStorageService.saveImage(imageFile);

        TypeDishes category = typeDishesRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Категория не найдена"));

        Type type = typeRepository.findById(typeId)
                .orElseThrow(() -> new IllegalArgumentException("Тип не найден"));

        Set<TypeDishes> categories = Set.of(category);
        Set<Type> types = Set.of(type);

        Dishes dish = new Dishes(name, price, weight, imageUrl, ingredient, categories, types);
        Dishes saved = dishesRepository.save(dish);

        return toDTO(saved);
    }

    public DishesDTO updateDish(Long id,
                                String name,
                                double price,
                                int weight,
                                String ingredient,
                                Long categoryId,
                                Long typeId,
                                MultipartFile imageFile) throws Exception {
        try {
            Dishes dish = dishesRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Блюдо не найдено"));

            dish.setName(name);
            dish.setPrice(price);
            dish.setWeight(weight);
            dish.setIngredient(ingredient);

            TypeDishes category = typeDishesRepository.findById(categoryId)
                    .orElseThrow(() -> new IllegalArgumentException("Категория не найдена"));
            dish.setTypeDishes(new HashSet<>(Set.of(category)));

            Type type = typeRepository.findById(typeId)
                    .orElseThrow(() -> new IllegalArgumentException("Тип не найден"));
            dish.setTypes(new HashSet<>(Set.of(type)));

            if (imageFile != null && !imageFile.isEmpty()) {
                String imageUrl = fileStorageService.saveImage(imageFile);
                dish.setImageUrl(imageUrl);
            }

            Dishes saved = dishesRepository.save(dish);
            return toDTO(saved);

        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    public Set<TypeDishes> loadCategories(List<String> categoryNames) {
        Set<TypeDishes> categories = new HashSet<>();
        for (String name : categoryNames) {
            TypeDishes category = typeDishesRepository.findByName(name);
            if (category != null) {
                categories.add(category);
            } else {
                throw new IllegalArgumentException("Категория с именем " + name + " не найдена!");
            }
        }
        return categories;
    }
    public Set<Type> loadTypes(List<String> typeNames) {
        if (typeNames == null || typeNames.isEmpty()) {
            return Collections.emptySet();
        }
        return typeNames.stream()
                .map(name -> typeRepository.findByName(name)
                        .orElseThrow(() -> new IllegalArgumentException("Тип блюда не найден: " + name)))
                .collect(Collectors.toSet());
    }

    public DishesDTO findById(Long dishId) {
        return dishesRepository.findById(dishId)
                .map(this::toDTO)
                .orElse(null);
    }

    private DishesDTO toDTO(Dishes dish) {
        DishesDTO dto = new DishesDTO(
                dish.getName(),
                dish.getPrice(),
                dish.getWeight(),
                dish.getImageUrl(),
                dish.getIngredient(),
                dish.getTypeDishes(),
                dish.getTypes()
        );
        dto.setId(dish.getId());
        return dto;
    }
    public DishesDTO toDTOFromDeleted(DeletedDishes dish) {
        DishesDTO dto = new DishesDTO(
                dish.getName(),
                dish.getPrice(),
                dish.getWeight(),
                dish.getImageUrl(),
                dish.getIngredient(),
                dish.getTypeDishes(),
                dish.getTypes()
        );
        dto.setId(dish.getId());
        return dto;
    }


    public Page<DishesDTO> getAllDishes(int page, int size, Long categoryId, Long typeId) {
        Page<Dishes> dishesPage;

        Pageable pageable = PageRequest.of(page, size);

        if (categoryId != null && typeId != null) {
            dishesPage = dishesRepository.findByTypeDishes_IdAndTypes_Id(categoryId, typeId, pageable);
        } else if (categoryId != null) {
            dishesPage = dishesRepository.findByTypeDishes_Id(categoryId, pageable);
        } else if (typeId != null) {
            dishesPage = dishesRepository.findByTypes_Id(typeId, pageable);
        } else {
            dishesPage = dishesRepository.findAll(pageable);
        }

        return dishesPage.map(this::toDTO);
    }


    @Transactional
    public void deleteDish(Long dishId) {
        Dishes dish = dishesRepository.findById(dishId)
                .orElseThrow(() -> new EntityNotFoundException("Блюдо не найдено"));

        DeletedDishes deletedDish = new DeletedDishes();
        deletedDish.setName(dish.getName());
        deletedDish.setPrice(dish.getPrice());
        deletedDish.setWeight(dish.getWeight());
        deletedDish.setImageUrl(dish.getImageUrl());
        deletedDish.setIngredient(dish.getIngredient());
        deletedDish.setTypeDishes(new HashSet<>(dish.getTypeDishes()));
        deletedDish.setTypes(new HashSet<>(dish.getTypes()));
        deletedDish.setDeletedAt(LocalDateTime.now());

        deletedDishesRepository.save(deletedDish);
        dishesRepository.delete(dish);
    }

    @Transactional
    public DishesDTO restoreDish(Long deletedDishId) {
        DeletedDishes deletedDish = deletedDishesRepository.findById(deletedDishId)
                .orElseThrow(() -> new EntityNotFoundException("Удалённое блюдо не найдено"));

        // Создаём новое блюдо на основе данных из DeletedDishes
        Dishes dish = new Dishes();
        dish.setName(deletedDish.getName());
        dish.setPrice(deletedDish.getPrice());
        dish.setWeight(deletedDish.getWeight());
        dish.setImageUrl(deletedDish.getImageUrl());
        dish.setIngredient(deletedDish.getIngredient());
        dish.setTypeDishes(new HashSet<>(deletedDish.getTypeDishes()));
        dish.setTypes(new HashSet<>(deletedDish.getTypes()));

        Dishes savedDish = dishesRepository.save(dish);
        deletedDishesRepository.delete(deletedDish);

        return toDTO(savedDish);
    }

    public void deleteById(Long id) {
        if (!deletedDishesRepository.existsById(id)) {
            throw new EntityNotFoundException("Удалённое блюдо с id " + id + " не найдено");
        }
        deletedDishesRepository.deleteById(id);
    }







   /* @Transactional
    public Dishes createDish(String name, double price, int weight, String imageUrl, String ingredient,
                             List<String> categoryNames, List<String> typeNames) {

        Set<TypeDishes> categories = loadCategories(categoryNames);
        Set<Type> types = loadTypes(typeNames);

        Dishes dish = new Dishes(name, price, weight, imageUrl, ingredient, categories, types);
        return dishesRepository.save(dish);
    }*/




    public void addAllDishes() {
        List<Dishes> dishesList = List.of(
                new Dishes("Четыре сезона", 680.0, 390, "/pizza/4 sezona.jpg", "Куриное филе, бекон, ветчина, охотничьи колбаски, помидор, сыр моцарелла, соус томатный.", loadCategories(List.of("Пицца")), loadTypes(null)),
                        new Dishes("Четыре Сыра", 680.0, 350, "/pizza/4 sira.jpg", "Сыр дор-блю, сыр пармезан, сыр моцарелла, сыр чизбургер, соус томатный",  loadCategories(List.of("Пицца")),loadTypes(List.of("Новинки"))),
                                new Dishes("BBQ", 795.0, 440, "/pizza/BBQ.jpg", "Охотничьи колбаски, соус BBQ, грибы шампиньоны, помидор, сыр моцарелла, соус томатный",  loadCategories(List.of("Пицца")),loadTypes(null)),
                new Dishes("BIF", 830.0, 380, "/pizza/BIF.jpg", "Говяжья вырезка, огурцы маринованные, лук криспи, сыр моцарелла, соус перечный.", loadCategories(List.of("Пицца")), loadTypes(List.of("Острое"))),
                                                new Dishes("Калипсо", 810.0, 370, "/pizza/Calipso.jpg", "Филе лосося, соус сливочный, помидор черри, сыр моцарелла, укроп, соус маминори с добавлением чили.", loadCategories(List.of("Пицца")),loadTypes(List.of("Острое","Новинки"))),
                                                        new Dishes("Мексиканская", 650.0, 440, "/pizza/Mexican.jpg", "Куриное филе, помидор, грибы шампиньоны, болгарский перец, сыр моцарелла, перец острый халапеньо, соус томатный.", loadCategories(List.of("Пицца")),loadTypes(List.of("Острое"))),
                                                                new Dishes("MIX", 680.0, 420, "/pizza/MIX.jpg", "Куриное филе, ветчина, бекон, салями, сыр моцарелла, помидор, сырный соус, соус томатный",  loadCategories(List.of("Пицца")),loadTypes(List.of("Хит"))),

                                                                        new Dishes("Аляска", 460.0, 215, "/rolls/Alaska.jpg", "Рис, нори, кунжут, сыр творожный, омлет томаго, соус спайс, икра тобика.", loadCategories(List.of("Роллы")),loadTypes(List.of("Новинки"))),
                                                                                new Dishes("BBQ-roll", 395.0, 330, "/rolls/BBQ.jpg", "Бекон, сыр творожный, помидоры, соус BBQ, лук зеленый, темпура, рис, нори.",  loadCategories(List.of("Роллы")),loadTypes(null)),
                                                                                        new Dishes("Филадельфия", 640.0, 250, "/rolls/Fila.jpg", "Лосось, сыр Филадельфия, огурец, рис, нори.", loadCategories(List.of("Роллы")),loadTypes(List.of("Хит"))),
                                                                                                new Dishes("Хот", 530.0, 280, "/rolls/Hot.jpg", "Сыр сливочный, томаго омлет, кунжут, соус Сэнсэй, сыр моцарелла, рис, нори.",  loadCategories(List.of("Роллы")),loadTypes(List.of("Хит"))),
                                                                                                        new Dishes("Сэнпай", 550.0, 300, "/rolls/Sempai.jpg", "Сливочный сыр, икра масаго, мука темпура, рис, нори.", loadCategories(List.of("Роллы")),loadTypes(null)),
                                                                                                                new Dishes("Вулкан", 570.0, 250, "/rolls/Vylkan.jpg", "Тартар из тунца, соус спайси острый, сыр сливочный, помидор, томаго омлет, кунжут, рис, нори.", loadCategories(List.of("Роллы")),loadTypes(List.of("Острое"))),
                                                                                                                        new Dishes("Яцуми", 420.0, 225, "/rolls/Yacymo.jpg", "Сыр сливочный, сыр Чизбургер, огурец, кунжут, рис, нори, перечный соус.", loadCategories(List.of("Роллы")),loadTypes(List.of("Вегетарианское","Острое","Новинки"))),

                                                                                                                                new Dishes("Гюдон", 640.0, 280, "/wok/Gydon.jpg", "Говядина, шампиньоны, лук ялтинский, лайм, соус черный перец, рис, желток, зелень, кунжут.",  loadCategories(List.of("Wok")),loadTypes(List.of("Новинки"))),
                                                                                                                                        new Dishes("Курица Мияги", 450.0, 300, "/wok/miyagi.jpg", "Нежнейшее филе курицы в сочетании с рисом и томленой стручковой фасолью и добавлением острого Тайского соуса Ким-чи с ялтинским луком и грибами.", loadCategories(List.of("Wok")),loadTypes(List.of("Острое"))),
                                                                                                                                                new Dishes("Говядина По", 680.0, 320, "/wok/po.jpg", "Нежнейшее филе телятины с лапшой соба , под сырно-сливочным соусом Дор-блю с помидором,зеленым луком.", loadCategories(List.of("Wok")),loadTypes(null)),
                                                                                                                                                        new Dishes("Сливочный Удон с курицей", 570.0, 400, "/wok/Slivochniy udon.jpg", "Лапша удон с маринованным куриным филе под фирменным сливочным соусом , шампиньонами, репчатым луком и икрой масаго.", loadCategories(List.of("Wok")),loadTypes(List.of("Хит"))),
                                                                                                                                                                new Dishes("Соба с лососем", 695.0, 410, "/wok/Soba.jpg", "Гречневая лапша, лосось, грибы, лук ялтинский, перец болгарский, помидор черри, имбирь.",  loadCategories(List.of("Wok")),loadTypes(null)),
                                                                                                                                                                        new Dishes("Жаренный рис Том-Ям", 595.0, 350, "/wok/Tom-Yam.jpg", "Креветка тигровая, куриное филе, рис, корень имбиря, молоко кокосовое, лук зеленый, имбирь, чеснок, кунжут, лайм.", loadCategories(List.of("Wok")),loadTypes(List.of("Хит"))),

                                                                                                                                                                                new Dishes("Салат Цезарь с курицей", 570.0, 240, "/salad/cezar.jpg", "Микс салат с куриным филе, пармезаном, перепелиным яйцом, беконом, хрустящими гренками под фирменным соусом, со сладкими помидорами черри.", loadCategories(List.of("Салаты")),loadTypes(List.of("Хит"))),
                                                                                                                                                                                        new Dishes("Салат с креветками манго-чили", 680.0, 200, "/salad/chili-mango.jpg", "Креветки тигровые, микс салата, помидоры черри, сыр Креметта, сочный апельсин под фирменным соусом манго-чили.", loadCategories(List.of("Салаты")),loadTypes(null)),
                                                                                                                                                                                                new Dishes("Салат Греческий", 530.0, 260, "/salad/grecheskiy.jpg", "Помидоры розовые, помидоры черри, перец болгарский, огурец, ялтинский лук, маслины, оливки, сыр фета. Заправка из  оливкового масла со специями.", loadCategories(List.of("Салаты")),loadTypes(List.of("Вегетарианское"))),
                                                                                                                                                                                                        new Dishes("Салат Хияши Вакаме", 420.0, 150, "/salad/hiyshi.jpg", "Водоросли Чука, кунжут, соус Гамадари.", loadCategories(List.of("Салаты")),loadTypes(List.of("Вегетарианское"))),
                                                                                                                                                                                                                new Dishes("Салат Теплый с морепродуктами", 640.0, 220, "/salad/tepliy.jpg", "Тигровая креветка, новозеландская мидия и кальмар под соусом Тартар в сочетании с миксом салата и помидорами черри.", loadCategories(List.of("Салаты")),loadTypes(List.of("Хит"))),

                                                                                                                                                                                                                        new Dishes("Бургер Блю-чиз", 640.0, 250, "/burgers/blu.jpg", "Картофельная булочка, сыр чеддер, салат микс соус дор-блю, маринованные корнишоны, котлета из мраморной говядины.", loadCategories(List.of("Бургеры")),loadTypes(List.of("Новинки"))),
                                                                                                                                                                                                                                new Dishes("Бургер Брусничный", 595.0, 235, "/burgers/brust.jpg", "Картофельная булочка, сыр креметта, котлета из мраморной говядины, соус Брусничный, корнишоны маринованные.", loadCategories(List.of("Бургеры")),loadTypes(null)),
                                                                                                                                                                                                                                        new Dishes("Бургер Детский", 420.0, 340, "/burgers/children.jpg", "Картофельная булочка, свежий огурец, куриная котлета, сыр Чеддер, соус Чили-майонез, подаётся с картофелем фри и кетчупом. Декор из сыра Моцарелла и маслин.", loadCategories(List.of("Бургеры")),loadTypes(List.of("Хит"))),
                                                                                                                                                                                                                                                new Dishes("Чизбургер", 595.0, 250, "/burgers/chiz.jpg", "Картофельная булочка, сыр чеддер, микс салата, соус перечный, маринованные корнишоны, котлета из мраморной говядины.",  loadCategories(List.of("Бургеры")),loadTypes(List.of("Хит"))),
                                                                                                                                                                                                                                                        new Dishes("Чикенбургер", 530.0, 280, "/burgers/chiken.jpg", "Картофельная булочка, салат айсберг, куриная котлета, сыр чеддер, соус перечный, свежий помидор и корнишоны.", loadCategories(List.of("Бургеры")),loadTypes(null)),
                                                                                                                                                                                                                                                                new Dishes("Фишбургер", 620.0, 240, "/burgers/fish.jpg", "Картофельная булочка, соус тар-тар, микс салата, свежий огурец, лук ялтинский, лосось охлажденный", loadCategories(List.of("Бургеры")),loadTypes(List.of("Новинки")))
                                                                                                                                                                                                                                                                );

        dishesRepository.saveAll(dishesList);
    }

}
