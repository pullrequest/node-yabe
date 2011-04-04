Title: Blog redesign - Techniques CSS utilisées en reconcevant le blog
Author: Mickael Daniel
Date: Apr 02 2011 08:00:00 GMT+0100 (CDT)
Categories: blog, CSS3


Cette semaine passé a été marqué par le redesign et légère refonte du blog ici présent. Je voulais rendre ce site plus facile à lire et à explorer (avec notamment une nouvelle fonction de recherche!). Je voulais aussi un style visuel se rapprochant de quelque chose de plus professionnel et élégant.

Finalement, ce fut surtout une belle opportunité que j'ai eu avec cette refonte d'utiliser quelques techniques CSS3 qui se dégrade relativement bien sur les navigateurs plus anciens. La dégradation élégante (ou gracieuse ou autre épithète qui fait joli, gracefull degradatation en anglais) est un terme que l'on entends ici et là depuis un moment. Dans le domaine du web design, ça signifie simplement de concevoir pour les derniers navigateurs en premier lieu, puis fournir des fallback (désolé pas de traduction correct qui me viennent à l'esprit sur le moment) pour les navigateurs plus anciens. C'est ce qui a été tenté ici, ce nouveau thème a été conçus pour les derniers navigateurs en premier lieu, tout en gardant a l'esprit les utilisateurs de navigateurs plus... anciens (ou ceux voulant tester "Comment ça rends sous IE6").

## noCss

Mais avant de rentrer dans la partie CSS3 et commencer à s'amuser un peu, petit tour de ce qui a changé, été ré-organisé ou des nouvelles fonctions qui ont été ajoutés.

### HTML 5
Parce que ça fait bien... Ce site utilise une partie des nouvelles possibilités de markup HTML5 (en restant light, `header`, `footer`, quelques article), ce qui se traduit souvent malheureusement par des problèmes de rendues assez exotique pour les navigateurs ne supportant pas ces nouveaux tags. En ayant gardé ceci à l'esprit, les sélecteurs CSS utilisés ne se repose pas sur les balises html5 mais sur des classes. Utilisé conjointement avec un bon CSS Reset comme celui d'Eric Meyer, même IE6 offre un rendu plus que satisfaisant.

### Meilleur expérience de lecture
Mes posts deviennent plus long et le design précédent ne permettait pas vraiment une lecture confortable (sûrement la première raison du redesign, j'avais les yeux qui piquaient en lisant mes propres posts). La taille par défaut est plus grande, le contraste avec le background est plus prononcé, l'interligne est enfin correct. Tout ceci associé avec l'utilisation de @font-face apporte une autre expérience de lecture (que j'espère meilleure).

### Archive et exploration
Ce site est encore relativement récent, datant de novembre 2010, mais les posts vont commencer à devenir nombreux. Le thème précédent ne permettait pas vraiment de recherche facile (de recherche tout court en fait) ou de vue simple listant les articles parus, leur date et éventuellement d'autres infos meta. Je suis encore en train de penser à une manière simple et efficace de présenter les archives (wheat par défaut ne dispose pas de cette fonctionanlité).

### Catégories
Les catégories sont finalement utlisés plus comme des tags. Elles ne sont plus aussi "centrale" qu'auparavant et n'apparaisse que dans la colonne de droite. Un rappel de ces tags est fait a plusieurs endroits pour chaque article (hover des titres sur la page d'accueil/archive, colonne de droite lors de la consultation d'un post).

Il faut encore que je les ré-organise un poil mais le principe est là.

#### Recherche

Bonne nouvelle avec l'ajout d'un formulaire de recherche qui marche pas mal. Wheat ne dispose pas de fonctionnalité de recherche. Je voulais un moyen simple et élégant de propose cette fonctionalité aux utilisateurs de passage, j'en suis venu à m'intérésser aux API Google Custom Search. Je vous laisse tester rapidement le rendu.

`Google REST Api + JSONP + JS Templating === happy developper`

J'ai dans l'idée de faire un petit article/tuto sur ce point particulier. L'approche est intéressante (en tout cas me rend un sacré service), fait intervenir des composant intéressant (rest+json+js templates) et peut-être intégré sur absolument n'importe quel site ou application web.

## CSS3

### @font-face

### Transitions

### Transforms

### Canvas Noise

## Pour finir

Ben, conclusion... Je risque bien de refaire un nouveau thème dans trois mois.
