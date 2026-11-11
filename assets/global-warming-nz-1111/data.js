window.GLOBAL_WARMING_DATA = (() => {
  const sources = {
    A1:{en:"For many environmentalists, the world seems to be getting warmer.",zh:"对许多环保主义者而言，世界似乎正在变得越来越暖。"},
    A2:{en:"As the nearest country of South Polar Region, New Zealand has maintained an upward trend in its average temperature in the past few years.",zh:"作为距离南极地区最近的国家，新西兰过去几年里的平均气温一直呈上升趋势。"},
    A3:{en:"However, the temperature in New Zealand will go up 4℃ in the next century while the polar region will go up more than 6℃.",zh:"然而，下个世纪新西兰的气温将上升4℃，而极地地区将上升6℃以上。"},
    A4:{en:"The different pictures of temperature stem from its surrounding ocean which acts like the air conditioner.",zh:"这种不同的气温变化情况源于新西兰周围的海洋，海洋发挥着类似空调的调节作用。"},
    A5:{en:"Thus New Zealand is comparatively fortunate.",zh:"因此，新西兰相对而言比较幸运。"},
    B1:{en:"Scientifically speaking, this temperature phenomenon in New Zealand originated from what researchers call SAM (Southern Annular Mode), which refers to the wind belt that circles the Southern Oceans including New Zealand and Antarctica.",zh:"从科学角度来说，新西兰的这种温度现象源于研究人员所称的南半球环状模态（SAM），它指的是环绕南大洋、包括新西兰和南极洲周边海域的风带。"},
    B2:{en:"Yet recent work has revealed that changes in SAM in New Zealand have resulted in a weakening of moisture during the summer, and more rainfall in other seasons.",zh:"然而，近期研究揭示，SAM在新西兰的变化导致夏季水汽减弱，而其他季节的降雨量增加。"},
    B3:{en:"A bigger problem may turn out to be heavier droughts for agricultural activities because of more water loss from soil, resulting in poorer harvest before winter when the rainfall arrives too late to rescue.",zh:"更大的问题可能是农业活动面临更加严重的干旱，因为土壤水分流失增加，导致冬季到来前收成变差，而那时降雨已经来得太晚，无法挽救作物。"},
    C1:{en:"Among all the calamities posed by drought, moisture deficit ranks the first.",zh:"在干旱造成的所有灾害中，水分亏缺最为严重。"},
    C2:{en:"Moisture deficit is the gap between the water plants need during the growing season and the water the earth can offer.",zh:"水分亏缺是植物在生长季所需的水量与土地能够提供的水量之间的差距。"},
    C3:{en:"Measures of moisture deficit were at their highest since the 1970s in New Zealand.",zh:"新西兰的水分亏缺指标达到了自20世纪70年代以来的最高水平。"},
    C4:{en:"Meanwhile, ecological analyses clearly show moisture deficit is imposed at different growth stage of crops.",zh:"与此同时，生态学分析清楚地表明，水分亏缺会在作物的不同生长阶段产生影响。"},
    C5:{en:"If moisture deficit occurs around a crucial growth stage, it will cause about 22% reduction in grain yield as opposed to moisture deficit at vegetative phase.",zh:"如果水分亏缺发生在关键生长阶段，谷物产量将减少约22%；相比之下，在营养生长期发生水分亏缺造成的影响较小。"},
    D1:{en:"Global warming is not only affecting agriculture production.",zh:"全球变暖影响的不仅仅是农业生产。"},
    D2:{en:"When scientists say the country's snow pack and glaciers are melting at an alarming rate due to global warming, the climate is putting another strain on the local places.",zh:"科学家指出，由于全球变暖，该国的积雪和冰川正以惊人的速度融化，这给当地地区带来了另一重压力。"},
    D3:{en:"For example, when the development of global warming is accompanied by the falling snow line the local skiing industry comes into a crisis.",zh:"例如，全球变暖伴随着雪线变化时，当地滑雪产业便会陷入危机。"},
    D4:{en:"The snow line may move up as the temperature goes up, and then the snow at the bottom will melt earlier.",zh:"随着气温上升，雪线可能上移，山脚处的积雪也会更早融化。"},
    D5:{en:"Fortunately, it is going to be favourable for the local skiing industry to tide over tough periods since the quantities of snowfall in some areas are more likely to increase.",zh:"幸运的是，某些地区的降雪量更有可能增加，这将有利于当地滑雪产业渡过困难时期。"},
    E1:{en:"What is the reaction of glacier region?",zh:"冰川地区会产生怎样的反应？"},
    E2:{en:"The climate change can be reflected in the glacier region in southern New Zealand or land covered by ice and snow.",zh:"气候变化可以从新西兰南部的冰川地区，或被冰雪覆盖的土地上反映出来。"},
    E3:{en:"The reaction of a glacier to a climatic change involves a complex chain of processes.",zh:"冰川对气候变化的反应涉及一系列复杂的过程。"},
    E4:{en:"Over time periods of years to several decades, cumulative changes in mass balance cause volume and thickness changes, which will affect the flow of ice via altered internal deformation and basal sliding.",zh:"在数年至数十年的时间跨度内，质量平衡的累积变化会引起体积和厚度变化；这些变化又会通过内部形变和底部滑动的改变影响冰体流动。"},
    E5:{en:"This dynamic reaction finally leads to glacier length changes, the advance or retreat of glacier tongues.",zh:"这种动态反应最终会导致冰川长度发生变化，也就是冰川舌向前推进或向后退缩。"},
    E6:{en:"Undoubtedly, glacier mass balance is a more direct signal of annual atmospheric conditions.",zh:"毫无疑问，冰川质量平衡是年度大气状况更直接的信号。"},
    F1:{en:"The latest research result of National Institute of Water and Atmospheric (NIWA) Research shows that glaciers line keeps moving up because of the impacts of global warming.",zh:"新西兰国家水与大气研究所（NIWA）的最新研究结果表明，受全球变暖影响，雪线持续上移。"},
    F2:{en:"Further losses of ice can be reflected in Mt. Cook Region.",zh:"库克山地区可以反映出进一步的冰量损失。"},
    F3:{en:"By 1996, a 14 km long sector of the glacier had melted down forming a melt lake (Hooker Lake) with a volume.",zh:"到1996年，冰川上一段长达14公里的区域已经融化，形成了一个融水湖（胡克湖）。"},
    F4:{en:"Melting of the glacier front at a rate of 40 m/yr will cause the glacier to retreat at a rather uniform rate.",zh:"冰川前端以每年40米的速度融化，将使冰川以相当均匀的速度后退。"},
    F5:{en:"Therefore, the lake will continue to grow until it reaches the glacier bed.",zh:"因此，湖泊将继续扩大，直到延伸至冰川底部。"},
    G1:{en:"A direct result of the melting glaciers is the change of high tides that serves the main factor for sea level rise.",zh:"冰川融化的一个直接结果是高潮位发生变化，而原文将其描述为海平面上升的主要因素。"},
    G2:{en:"The trend of sea level rise will bring a threat to the groundwater system for its hyper-saline groundwater and then pose a possibility to decrease the agricultural production.",zh:"海平面上升趋势会威胁地下水系统，使地下水盐度过高，并进一步带来农业产量下降的可能性。"},
    G3:{en:"Many experts believe that the best way to counter this trend is to give a longer-term view of sea level change in New Zealand.",zh:"许多专家认为，应对这一趋势的最佳方式是从更长远的角度看待新西兰的海平面变化。"},
    G4:{en:"Indeed, the coastal boundaries need to be upgraded and redefined.",zh:"事实上，海岸边界需要升级并重新界定。"},
    H1:{en:"There is no doubt that global warming has affected New Zealand in many aspects.",zh:"毫无疑问，全球变暖已经在许多方面影响了新西兰。"},
    H2:{en:"The emphasis on the global warming should be based on the joint efforts of local people and experts who conquer the tough period.",zh:"应对全球变暖的重点应建立在当地居民与专家共同努力、克服困难的基础上。"},
    H3:{en:"For instance, farmers are taking a long term, multi-generational approach to adjust the breeds and species according to the temperature.",zh:"例如，农民正在采取长期、跨世代的方法，根据气温调整品种和物种。"},
    H4:{en:"Agriculturists also find ways to tackle the problems that may bring to the soil.",zh:"农学家也在寻找解决气候变化可能给土壤带来问题的方法。"},
    H5:{en:"In broad terms, going forward, the systemic resilience that's been going on a long time in the ecosystem will continue.",zh:"总体而言，展望未来，生态系统中长期形成的系统韧性将继续发挥作用。"},
    I1:{en:"How about animals' reaction?",zh:"那么动物会如何应对呢？"},
    I2:{en:"Experts have surprisingly realised that animals have unconventional adaptation to global warming.",zh:"专家惊讶地发现，动物对全球变暖具有不同寻常的适应方式。"},
    I3:{en:"A study has looked at sea turtles on a few northern beaches in New Zealand and it is very interesting to find that sea turtles can become male or female according to the temperature.",zh:"一项研究考察了新西兰北部几个海滩上的海龟，并有趣地发现，海龟的性别会受到温度影响。"},
    I4:{en:"Further researches will try to find out how rising temperatures would affect the ratio of sex reversal in their growth.",zh:"后续研究将尝试查明气温上升会如何影响海龟成长过程中的性别变化比例。"},
    I5:{en:"Clearly, the temperature of the nest plays a vital role in the sexes of the baby turtles.",zh:"显然，巢穴温度对幼龟的性别起着至关重要的作用。"},
    J1:{en:"Tackling the problems of global warming is never easy in New Zealand, because records show the slow process of global warming may have a different impact on various regions.",zh:"在新西兰，应对全球变暖问题绝非易事，因为记录表明，全球变暖的缓慢进程可能对不同地区产生不同影响。"},
    J2:{en:"For New Zealand, the emission of carbon dioxide only accounts for 0.5% of the world's total, which has met the governmental standard.",zh:"对新西兰而言，二氧化碳排放量仅占全球总量的0.5%，并且已经达到政府标准。"},
    J3:{en:"However, New Zealand's effort counts only a tip of the iceberg.",zh:"然而，新西兰所做的努力仅仅是冰山一角。"},
    J4:{en:"So far, global warming has been a world issue that still hangs in an ambiguous future.",zh:"到目前为止，全球变暖仍然是一个未来走向不明朗的全球性问题。"}
  };
  const exampleGroups = {
    climate:[
      {skill:"听力",en:"The average temperature has risen steadily over the past decade.",zh:"过去十年，平均气温稳步上升。"},
      {skill:"口语",en:"I think climate change affects different regions in different ways.",zh:"我认为气候变化对不同地区的影响各不相同。"},
      {skill:"阅读",en:"The report identifies a clear link between rising temperatures and water shortages.",zh:"报告指出气温上升与水资源短缺之间存在明显联系。"},
      {skill:"写作",en:"Governments should take coordinated action to reduce the long-term impact of climate change.",zh:"政府应采取协调一致的行动，减少气候变化的长期影响。"}
    ],
    agriculture:[
      {skill:"听力",en:"Farmers reported a reduction in crop yields after a prolonged drought.",zh:"农民报告称，长期干旱后农作物产量有所下降。"},
      {skill:"口语",en:"Local farmers have to adapt their methods to changing weather conditions.",zh:"当地农民不得不根据不断变化的天气条件调整耕作方式。"},
      {skill:"阅读",en:"A lack of soil moisture during the growing season can affect grain yield.",zh:"生长季节土壤水分不足会影响谷物产量。"},
      {skill:"写作",en:"Investment in irrigation can help protect agricultural production from severe droughts.",zh:"投资灌溉设施有助于保护农业生产免受严重干旱的影响。"}
    ],
    glacier:[
      {skill:"听力",en:"The glacier is retreating at a steady rate as the ice continues to melt.",zh:"随着冰体持续融化，冰川正以稳定的速度后退。"},
      {skill:"口语",en:"I would love to see a glacier before climate change alters the landscape further.",zh:"我很想在气候变化进一步改变地貌之前亲眼看看冰川。"},
      {skill:"阅读",en:"Changes in mass balance can alter the thickness and movement of a glacier.",zh:"质量平衡的变化会改变冰川的厚度和运动。"},
      {skill:"写作",en:"The rapid retreat of glaciers is a visible indicator of global warming.",zh:"冰川迅速后退是全球变暖的一个明显指标。"}
    ],
    environment:[
      {skill:"听力",en:"The local community has joined experts to tackle environmental problems.",zh:"当地社区与专家共同解决环境问题。"},
      {skill:"口语",en:"Protecting the environment requires long-term commitment rather than short-term action.",zh:"保护环境需要长期投入，而不是短期行动。"},
      {skill:"阅读",en:"The ecosystem has developed a degree of resilience to environmental stress.",zh:"生态系统已经形成了一定程度的环境压力恢复能力。"},
      {skill:"写作",en:"Joint efforts are essential if countries want to address global environmental challenges.",zh:"如果各国希望应对全球环境挑战，共同努力至关重要。"}
    ],
    sea:[
      {skill:"听力",en:"Rising sea levels may threaten coastal communities and groundwater supplies.",zh:"海平面上升可能威胁沿海社区和地下水供应。"},
      {skill:"口语",en:"People living near the coast may face greater risks in the future.",zh:"未来，居住在海岸附近的人们可能面临更大的风险。"},
      {skill:"阅读",en:"Saltwater intrusion can increase the salinity of underground water.",zh:"海水入侵会提高地下水的盐度。"},
      {skill:"写作",en:"Coastal boundaries and infrastructure need to be reviewed in response to rising sea levels.",zh:"为应对海平面上升，需要重新审视海岸边界和基础设施。"}
    ],
    adaptation:[
      {skill:"听力",en:"Some species have developed unusual ways to adapt to warmer environments.",zh:"一些物种已经形成了适应较温暖环境的特殊方式。"},
      {skill:"口语",en:"Animals often adapt to changes in their natural habitats over time.",zh:"随着时间推移，动物往往会适应自然栖息地的变化。"},
      {skill:"阅读",en:"Nest temperature plays an important role in temperature-dependent sex determination.",zh:"巢穴温度在温度依赖型性别决定过程中发挥重要作用。"},
      {skill:"写作",en:"The ability to adapt to changing conditions is vital to the survival of many species.",zh:"适应不断变化环境的能力对许多物种的生存至关重要。"}
    ],
    research:[
      {skill:"听力",en:"Recent research has revealed a significant change in seasonal rainfall.",zh:"近期研究揭示了季节性降雨的显著变化。"},
      {skill:"口语",en:"I would like to know more about how scientists measure climate change.",zh:"我想进一步了解科学家如何测量气候变化。"},
      {skill:"阅读",en:"The findings suggest that cumulative changes can have long-term effects.",zh:"研究发现表明，累积变化可能产生长期影响。"},
      {skill:"写作",en:"Further research is needed to determine the full impact of rising temperatures.",zh:"还需要进一步研究，以确定气温上升的全部影响。"}
    ],
    policy:[
      {skill:"听力",en:"The country has introduced measures to reduce carbon dioxide emissions.",zh:"该国已经采取措施减少二氧化碳排放。"},
      {skill:"口语",en:"I believe governments should work together on global issues.",zh:"我认为各国政府应该共同应对全球性问题。"},
      {skill:"阅读",en:"The policy accounts for regional differences in environmental conditions.",zh:"该政策考虑到了环境条件的地区差异。"},
      {skill:"写作",en:"A long-term approach is more likely to produce sustainable results.",zh:"长期策略更有可能带来可持续的成果。"}
    ]
  };
  const cards=[];
  const add=(en,zh,stars,type,sourceId,group,collocations=[],note="",questions=[],origin="原文词汇",ipa="")=>{
    const id="gwnz-"+String(cards.length+1).padStart(3,"0");
    const paragraph=/^[A-J]/.test(sourceId)?sourceId[0]:"Q";
    const wrong=[29,31,35,37,38,39,40];
    cards.push({id,material:"global-warming",en,zh,stars,type,pos:type==="word"?"词汇":type==="phrase"?"短语":"固定搭配",origin,priority:questions.some(q=>wrong.includes(q)),paragraph,sourceId,ipa,questions,exampleGroup:group,note,collocations:collocations.map(x=>({en:x[0],zh:x[1]}))});
  };
  const c=(en,zh)=>[en,zh];
  // ★★★★★ 核心掌握
  add("stem from","源于；起因于",5,"phrase","A4","climate",[c("stem from","源于"),c("originate from","起源于"),c("arise from","由……引起")],"强调追溯原因；常与抽象名词或现象搭配。",[27]);
  add("result in","导致；造成",5,"phrase","B2","climate",[c("result in a decline","导致下降"),c("result in serious damage","造成严重损害"),c("lead to","导致")],"强调某个原因产生的结果。",[28,29]);
  add("turn out to be","最终成为；结果是",5,"phrase","B3","climate",[c("turn out to be a problem","结果成为一个问题"),c("prove to be","结果证明是"),c("end up being","最终变成")],"用于描述最终结果或事后发现。",[28]);
  add("moisture deficit","水分亏缺；水分不足",5,"collocation","C1","agriculture",[c("soil moisture deficit","土壤水分亏缺"),c("water deficit","水分不足"),c("moisture shortage","水分短缺")],"本篇核心概念：植物所需水量超过土壤可提供的水量。",[29],"原文词汇","ˈmɔɪstʃə ˈdefɪsɪt");
  add("gap between A and B","A与B之间的差距",5,"phrase","C2","research",[c("the gap between supply and demand","供需差距"),c("a widening gap","不断扩大的差距"),c("the difference between A and B","A与B之间的差异")],"注意between后面连接两个并列对象。",[29]);
  add("water loss from soil","土壤水分流失",5,"collocation","B3","agriculture",[c("loss of soil moisture","土壤水分流失"),c("soil moisture depletion","土壤水分耗竭"),c("water retention in soil","土壤保水能力")],"本篇中是干旱加剧的原因之一。",[28]);
  add("growing season","生长季；植物生长季节",5,"collocation","C2","agriculture",[c("during the growing season","在生长季期间"),c("a longer growing season","更长的生长季"),c("crop-growing period","作物生长期")],"农业与生态主题常见表达。",[29],"原文词汇","ˈɡrəʊɪŋ ˈsiːzən");
  add("crucial growth stage","关键生长阶段",5,"collocation","C5","agriculture",[c("a critical growth stage","关键生长阶段"),c("a key developmental stage","关键发育阶段"),c("at a crucial stage","在关键阶段")],"crucial强调对结果具有决定性影响。",[29]);
  add("grain yield","谷物产量",5,"collocation","C5","agriculture",[c("crop yield","作物产量"),c("agricultural output","农业产出"),c("yield reduction","产量下降")],"yield既可作名词表示产量，也可作动词表示产生、屈服。",[29],"原文词汇","ɡreɪn jiːld");
  add("reduction in","……方面的减少",5,"phrase","C5","agriculture",[c("a reduction in grain yield","谷物产量减少"),c("a decrease in production","产量下降"),c("a decline in output","产出下降")],"常用于描述数量、比例、产量的下降。",[29,34]);
  add("as opposed to","与……相对；而不是",5,"phrase","C5","research",[c("in contrast to","与……形成对比"),c("rather than","而不是"),c("as against","与……相对")],"用于比较两个情况或概念。",[29]);
  add("at an alarming rate","以惊人的速度；以令人担忧的速度",5,"phrase","D2","climate",[c("at a rapid rate","以很快的速度"),c("at an unprecedented rate","以空前的速度"),c("melt at an alarming rate","以惊人的速度融化")],"alarming带有令人担忧、警示的负面语气。",[30]);
  add("be accompanied by","伴随着；与……同时发生",5,"phrase","D3","climate",[c("be accompanied by changes","伴随着变化"),c("be associated with","与……相关"),c("coincide with","与……同时发生")],"注意被动结构be accompanied by。",[30]);
  add("tide over tough periods","帮助渡过困难时期",5,"phrase","D5","policy",[c("tide someone over","帮助某人渡过难关"),c("get through difficult times","熬过困难时期"),c("weather a difficult period","挺过困难时期")],"tide over常用于困难、危机、过渡阶段。",[30]);
  add("cumulative changes","累积变化",5,"collocation","E4","research",[c("cumulative effect","累积效应"),c("accumulated changes","累积变化"),c("cumulative impact","累积影响")],"强调多个变化在一段时间内逐渐叠加。",[31]);
  add("mass balance","质量平衡；冰川物质平衡",5,"collocation","E4","glacier",[c("glacier mass balance","冰川质量平衡"),c("annual mass balance","年度质量平衡"),c("mass-balance changes","质量平衡变化")],"冰川学术语，涉及冰川积累与消融之间的平衡。",[31]);
  add("volume and thickness","体积和厚度",5,"collocation","E4","glacier",[c("changes in volume and thickness","体积和厚度变化"),c("ice volume","冰体体积"),c("ice thickness","冰层厚度")],"注意volume与thickness分别表示体积和厚度。",[31]);
  add("internal deformation","内部形变",5,"collocation","E4","glacier",[c("deformation of ice","冰体形变"),c("internal structure","内部结构"),c("ice deformation","冰体形变")],"glacier主题专业表达。",[31]);
  add("basal sliding","底部滑动；冰川底部滑动",5,"collocation","E4","glacier",[c("glacier-bed sliding","冰川底部滑动"),c("sliding at the glacier bed","冰川基底处的滑动")],"指冰川底部相对于下方基底发生的滑动。",[31]);
  add("lead to","导致；引起",5,"phrase","E5","climate",[c("lead to changes","导致变化"),c("lead to a decline","导致下降"),c("give rise to","引起")],"常用于说明因果链中的结果。",[31,40]);
  add("pose a threat to","对……构成威胁",5,"phrase","G2","sea",[c("pose a serious threat to","对……构成严重威胁"),c("put ... at risk","使……处于风险之中"),c("endanger","危及")],"pose在这里不是摆姿势，而是造成、构成。",[34]);
  add("groundwater system","地下水系统",5,"collocation","G2","sea",[c("groundwater resources","地下水资源"),c("underground water system","地下水系统"),c("groundwater supply","地下水供应")],"注意groundwater通常写成一个词。",[34]);
  add("agricultural production","农业生产；农业产量",5,"collocation","G2","agriculture",[c("agricultural output","农业产出"),c("farm production","农场生产"),c("agricultural productivity","农业生产率")],"正确形容词形式是agricultural，而不是agriculture production。",[34]);
  add("coastal boundaries","海岸边界",5,"collocation","G4","sea",[c("coastal boundaries","海岸边界"),c("coastal limits","海岸界限"),c("coastal zones","沿海地区")],"本篇摘要填空第35题答案。",[35],"原文词汇");
  add("upgrade and redefine","升级并重新界定",5,"phrase","G4","sea",[c("upgrade infrastructure","升级基础设施"),c("redefine boundaries","重新界定边界"),c("revise coastal limits","修订海岸界限")],"upgrade强调提升，redefine强调重新定义。",[35]);
  add("tackle a problem","解决；处理问题",5,"phrase","H4","environment",[c("tackle environmental problems","解决环境问题"),c("address an issue","处理问题"),c("deal with a challenge","应对挑战")],"tackle常用于主动解决棘手问题。",[36,37,40]);
  add("long-term, multi-generational approach","长期、跨世代的方法",5,"collocation","H3","policy",[c("take a long-term approach","采取长期策略"),c("multi-generational planning","跨世代规划"),c("long-term strategy","长期战略")],"multi-generational强调跨越多个世代。",[36,37]);
  add("adapt ... according to ...","根据……调整；按照……适应",5,"phrase","H3","adaptation",[c("adjust ... according to ...","根据……调整"),c("adapt ... in response to ...","为应对……而调整"),c("modify ... based on ...","基于……修改")],"adjust与adapt都可表示调整，但adapt更强调适应环境。",[36,37]);
  add("adaptation to","对……的适应",5,"collocation","I2","adaptation",[c("adapt to climate change","适应气候变化"),c("adaptation to global warming","对全球变暖的适应"),c("adaptive response","适应性反应")],"adaptation是名词，adapt是动词。",[38]);
  add("play a vital role","发挥至关重要的作用",5,"phrase","I5","adaptation",[c("play an important role in","在……中发挥重要作用"),c("be crucial to","对……至关重要"),c("be essential for","对……必不可少")],"vital比important语气更强。",[38]);
  add("account for","占据；占……比例；解释",5,"phrase","J2","policy",[c("account for 0.5%","占0.5%"),c("make up","构成；占据"),c("constitute","构成；组成")],"本篇中是占比含义；也可表示解释原因。",[40]);
  add("a tip of the iceberg","冰山一角；整体中很小的一部分",5,"idiom","J3","policy",[c("only a small part of","仅仅是……的一小部分"),c("the tip of the iceberg","冰山一角"),c("a much larger issue","一个更大的问题")],"用于说明眼前所见只是整体的一小部分。",[40]);
  add("impact on","对……的影响",5,"collocation","J1","climate",[c("have an impact on","对……产生影响"),c("the effect on","对……的影响"),c("influence on","对……的影响")],"impact可作名词或动词。",[39]);
  add("vulnerable to","容易受到……伤害；易受……影响",5,"phrase","I2","adaptation",[c("be susceptible to","易受……影响"),c("be at risk from","面临……风险"),c("vulnerable populations","弱势群体")],"vulnerable通常带有易受伤害或不利影响的含义。",[38],"题干 / 选项","ˈvʌlnərəbl");
  add("diminish the effect","减轻影响；降低影响程度",5,"phrase","G3","sea",[c("reduce the impact","减少影响"),c("lessen the effect","减轻影响"),c("mitigate the consequences","缓解后果")],"diminish表示逐渐减少、减弱。",[35],"题干 / 选项","dɪˈmɪnɪʃ");
  add("cause a reduction in","导致……减少",5,"phrase","C5","agriculture",[c("cause a decline in","导致……下降"),c("result in a decrease in","导致……减少"),c("bring about a reduction in","造成……减少")],"cause + 名词结果；与result in近义。",[29]);
  add("in the long run","从长远来看",5,"phrase","G3","policy",[c("over the long term","从长远来看"),c("in the longer term","从更长远的角度"),c("from a long-term perspective","从长期视角看")],"常用于写作段落开头或结论。",[35]);
  add("as a result of","由于；作为……的结果",5,"phrase","B2","climate",[c("because of","因为"),c("owing to","由于"),c("due to","由于")],"后接名词或名词短语，不直接接完整句子。",[28,29],"题干 / 选项");
  add("in response to","为应对……；作为对……的回应",5,"phrase","H3","adaptation",[c("in response to rising temperatures","为应对气温上升"),c("as a response to","作为对……的回应"),c("in reaction to","针对……作出反应")],"适合环境、政策、社会变化类写作。",[36,37]);
  add("take a long-term approach","采取长期策略",5,"phrase","H3","policy",[c("adopt a long-term strategy","采用长期战略"),c("take a long-term view","采取长远眼光"),c("long-term planning","长期规划")],"强调持续、跨阶段的规划。",[36]);
  add("maintain a balance between A and B","在A与B之间保持平衡",5,"phrase","H2","policy",[c("strike a balance between","在……之间取得平衡"),c("achieve a balance between","实现……之间的平衡")],"可迁移到教育、经济、环境等话题。",[],"写作迁移语块");
  add("make joint efforts","共同努力",5,"phrase","H2","policy",[c("joint efforts","共同努力"),c("collective efforts","集体努力"),c("work together","共同合作")],"可用于政府、社会、个人协同解决问题。",[],"写作迁移语块");
  add("address environmental challenges","应对环境挑战",5,"phrase","H4","environment",[c("tackle environmental issues","解决环境问题"),c("deal with ecological problems","处理生态问题"),c("address global challenges","应对全球挑战")],"address在这里是动词，表示着手处理。",[],"写作迁移语块");
  // ★★★★ 重点学术与主题词汇
  add("environmentalist","环保主义者",4,"word","A1","environment",[c("environmental activist","环保活动人士"),c("environmental protection","环境保护")],"environmentalist是关注环境保护的人。",[],"原文词汇","ɪnˌvaɪrənˈmentəlɪst");
  add("maintain an upward trend","保持上升趋势",4,"phrase","A2","climate",[c("show an upward trend","呈现上升趋势"),c("continue to rise","持续上升"),c("a steady increase","稳步增长")],"maintain表示维持某种状态或趋势。",[27]);
  add("average temperature","平均气温",4,"collocation","A2","climate",[c("mean temperature","平均温度"),c("average annual temperature","年平均气温")],"常见气候与环境主题词汇。",[27]);
  add("surrounding ocean","周围的海洋",4,"collocation","A4","climate",[c("surrounding waters","周边海域"),c("ocean currents","洋流")],"surrounding在这里作形容词。",[27]);
  add("act like","起……作用；表现得像",4,"phrase","A4","climate",[c("act as","充当；起……作用"),c("function as","发挥……功能"),c("serve as","作为")],"此处不是简单的“像”，而是发挥类似功能。",[27]);
  add("comparatively fortunate","相对幸运的",4,"phrase","A5","climate",[c("relatively fortunate","相对幸运"),c("be better off","处境更好")],"comparatively表示相对而言。",[27]);
  add("Southern Annular Mode (SAM)","南半球环状模态",4,"collocation","B1","research",[c("atmospheric circulation","大气环流"),c("wind circulation pattern","风场环流模式")],"气候学专有概念，了解即可。",[28],"原文词汇");
  add("wind belt","风带",4,"collocation","B1","climate",[c("prevailing winds","盛行风"),c("wind circulation","风的环流")],"风带是环绕一定区域的风系。",[28]);
  add("circle","环绕；围绕",4,"word","B1","climate",[c("surround","环绕"),c("encircle","围绕"),c("revolve around","围绕……旋转")],"熟词生义：circle作动词表示环绕。",[28],"原文词汇","ˈsɜːkl");
  add("weakening of moisture","水汽减弱",4,"collocation","B2","climate",[c("reduced moisture","水汽减少"),c("decreased moisture content","水分含量下降")],"原文用法较宽泛，理解为水汽减少即可。",[28]);
  add("rainfall in other seasons","其他季节的降雨",4,"collocation","B2","climate",[c("seasonal rainfall","季节性降雨"),c("increased precipitation","降水增加")],"rainfall通常指降雨量。",[28]);
  add("heavier droughts","更严重的干旱",4,"collocation","B3","agriculture",[c("severe droughts","严重干旱"),c("prolonged droughts","长期干旱"),c("drought conditions","干旱状况")],"这里heavier表达干旱程度加重。",[28]);
  add("agricultural activities","农业活动",4,"collocation","B3","agriculture",[c("farming activities","农业活动"),c("agricultural practices","农业实践")],"农业主题常见表达。",[28]);
  add("calamity","灾难；灾祸",4,"word","C1","environment",[c("natural calamity","自然灾害"),c("disaster","灾难"),c("catastrophe","大灾难")],"比problem严重，常指造成重大损害的事件。",[29],"原文词汇","kəˈlæməti");
  add("rank first","位居第一；排名第一",4,"phrase","C1","research",[c("rank highest","排名最高"),c("come first","位居第一"),c("top the list","名列前茅")],"rank既可作名词也可作动词。",[29]);
  add("ecological analyses","生态学分析",4,"collocation","C4","research",[c("ecological research","生态学研究"),c("environmental analysis","环境分析")],"ecological是生态学的。",[29]);
  add("measures of moisture deficit","水分亏缺的测量指标",4,"collocation","C3","research",[c("measurements of","……的测量值"),c("indicators of","……的指标"),c("assessment of","……的评估")],"measure在这里是测量指标，不是采取措施。",[29]);
  add("vegetative phase","营养生长期",4,"collocation","C5","agriculture",[c("vegetative growth stage","营养生长阶段"),c("reproductive phase","生殖生长期")],"植物生长阶段的专业术语。",[29],"原文词汇");
  add("snow pack","积雪层；积雪",4,"collocation","D2","glacier",[c("snow cover","积雪覆盖"),c("snow accumulation","积雪累积")],"snowpack也常写作一个词。",[30]);
  add("snow line","雪线",4,"collocation","D3","glacier",[c("rising snow line","雪线上升"),c("altitude of the snow line","雪线海拔")],"区分snow line和snowfall。",[30],"原文词汇");
  add("glacier","冰川",4,"word","D2","glacier",[c("melting glacier","融化中的冰川"),c("glacier retreat","冰川后退"),c("glacial ice","冰川冰")],"地理、环境主题基础学术词。",[30,31,32],"原文词汇","ˈɡlæsiə");
  add("put a strain on","给……造成压力；增加负担",4,"phrase","D2","environment",[c("put pressure on","给……施加压力"),c("place a burden on","给……带来负担"),c("strain local resources","使当地资源承压")],"strain可表示压力、负担。",[30]);
  add("skiing industry","滑雪产业",4,"collocation","D3","environment",[c("ski industry","滑雪产业"),c("ski tourism","滑雪旅游业")],"旅游与经济主题词汇。",[30]);
  add("come into a crisis","陷入危机",4,"phrase","D3","environment",[c("face a crisis","面临危机"),c("enter a period of crisis","进入危机时期"),c("be in crisis","处于危机中")],"更自然常见的表达是face a crisis或be in crisis。",[30]);
  add("quantities of snowfall","降雪量",4,"collocation","D5","glacier",[c("the amount of snowfall","降雪量"),c("snowfall levels","降雪水平"),c("heavy snowfall","大雪")],"原文quantities of snowfall不够自然，通常说amount of snowfall。",[30]);
  add("favourable","有利的；有益的",4,"word","D5","policy",[c("favourable conditions","有利条件"),c("be favourable to","对……有利"),c("beneficial","有益的")],"英式拼写；美式为favorable。",[30],"原文词汇","ˈfeɪvərəbl");
  add("glacier region","冰川地区",4,"collocation","E2","glacier",[c("glacial region","冰川地区"),c("glacier area","冰川区域")],"glacier作名词修饰region。",[31,32]);
  add("complex chain of processes","一系列复杂的过程",4,"collocation","E3","research",[c("a series of processes","一系列过程"),c("a complex sequence","复杂的连续过程")],"chain在这里是连续环节，不是实体链条。",[31]);
  add("over time periods of","在……时间跨度内",4,"phrase","E4","research",[c("over a period of","在一段时间内"),c("throughout a period of","贯穿某个时期")],"后接时间长度。",[31]);
  add("several decades","数十年",4,"collocation","E4","research",[c("a few decades","几十年"),c("decades-long","持续数十年的")],"decade为十年。",[31]);
  add("flow of ice","冰体流动",4,"collocation","E4","glacier",[c("ice flow","冰流"),c("glacial movement","冰川运动")],"flow在这里作名词。",[31]);
  add("glacier tongues","冰川舌",4,"collocation","E5","glacier",[c("glacier front","冰川前端"),c("glacier terminus","冰川末端")],"冰川舌是冰川向下延伸的舌状部分。",[31,32],"原文词汇");
  add("dynamic reaction","动态反应",4,"collocation","E5","research",[c("dynamic response","动态响应"),c("physical response","物理反应")],"dynamic强调变化和运动过程。",[31]);
  add("advance or retreat","前进或后退",4,"collocation","E5","glacier",[c("glacier advance","冰川前进"),c("glacier retreat","冰川后退"),c("expansion or recession","扩张或消退")],"advance与retreat是方向相反的一组词。",[31]);
  add("annual atmospheric conditions","年度大气状况",4,"collocation","E6","climate",[c("annual climate conditions","年度气候状况"),c("atmospheric conditions","大气状况")],"annual表示每年的、年度的。",[31]);
  add("glacier front","冰川前端",4,"collocation","F4","glacier",[c("glacier terminus","冰川末端"),c("ice front","冰体前缘")],"front在这里表示最前端。",[32]);
  add("melt lake","融水湖",4,"collocation","F3","glacier",[c("glacial lake","冰川湖"),c("meltwater lake","融水湖")],"冰川融水形成的湖泊。",[32]);
  add("retreat at a uniform rate","以均匀速度后退",4,"phrase","F4","glacier",[c("retreat steadily","稳定地后退"),c("recede at a constant rate","以恒定速度消退")],"uniform强调均匀、一致。",[32]);
  add("glacier bed","冰川底部；冰川基底",4,"collocation","F5","glacier",[c("glacier base","冰川底部"),c("bed beneath a glacier","冰川下方的基底")],"地貌和冰川专业表达。",[32]);
  add("high tides","高潮；高潮位",4,"collocation","G1","sea",[c("high-water levels","高潮水位"),c("tidal levels","潮位"),c("high tide","高潮")],"tide是潮汐；high tide是高潮。",[33]);
  add("sea level rise","海平面上升",4,"collocation","G1","sea",[c("rising sea levels","海平面上升"),c("sea-level increase","海平面增高")],"环境与地理主题高频表达。",[33,34]);
  add("hyper-saline groundwater","高盐度地下水",4,"collocation","G2","sea",[c("highly saline groundwater","高盐度地下水"),c("groundwater salinity","地下水盐度")],"hyper-表示超过正常程度；saline表示含盐的。",[34]);
  add("longer-term view","更长远的视角",4,"collocation","G3","policy",[c("long-term perspective","长期视角"),c("long-range outlook","长远展望")],"view在这里是观点、视角。",[35]);
  add("joint efforts","共同努力",4,"collocation","H2","policy",[c("collective efforts","集体努力"),c("combined efforts","共同努力"),c("work together","共同合作")],"可用于政府、社区、个人合作。",[36,37]);
  add("breeds and species","品种与物种",4,"collocation","H3","adaptation",[c("animal breeds","动物品种"),c("crop varieties","作物品种"),c("different species","不同物种")],"breed多用于品种/繁育，species指物种。",[36]);
  add("agriculturist","农学家；农业专家",4,"word","H4","agriculture",[c("agricultural scientist","农业科学家"),c("agricultural expert","农业专家")],"不要与agricultural（形容词）混淆。",[36,37],"原文词汇","ˌæɡrɪˈkʌltʃərɪst");
  add("systemic resilience","系统韧性",4,"collocation","H5","environment",[c("ecosystem resilience","生态系统韧性"),c("system resilience","系统韧性"),c("environmental resilience","环境韧性")],"systemic表示系统层面的。",[36,37]);
  add("ecosystem","生态系统",4,"word","H5","environment",[c("natural ecosystem","自然生态系统"),c("ecosystem services","生态系统服务"),c("ecosystem resilience","生态系统韧性")],"生态与环境主题常见词。",[36,37],"原文词汇","ˈiːkəʊsɪstəm");
  add("unconventional adaptation","非传统的适应方式",4,"collocation","I2","adaptation",[c("unusual adaptation","不同寻常的适应"),c("adaptive response","适应性反应"),c("unexpected adaptation","意想不到的适应方式")],"unconventional表示不按常规的。",[38]);
  add("further research","进一步研究",4,"collocation","I4","research",[c("subsequent research","后续研究"),c("additional studies","补充研究"),c("further investigation","进一步调查")],"research通常作不可数名词，不说researches。",[38]);
  add("sex ratio","性别比例",4,"collocation","I4","adaptation",[c("male-to-female ratio","雌雄比例"),c("sex ratio","性别比例")],"人口、动物生态研究常见表达。",[38]);
  add("nest temperature","巢穴温度",4,"collocation","I5","adaptation",[c("nesting temperature","筑巢环境温度"),c("nest environment","巢穴环境")],"与温度依赖型性别决定相关。",[38]);
  add("records show","记录表明；数据表明",4,"phrase","J1","research",[c("data show","数据表明"),c("evidence indicates","证据表明"),c("research suggests","研究显示")],"学术阅读与写作常用引证表达。",[39,40]);
  add("various regions","不同地区；各个地区",4,"collocation","J1","climate",[c("different areas","不同区域"),c("multiple regions","多个地区"),c("across regions","跨地区")],"various表示多种不同的。",[39]);
  add("carbon dioxide emissions","二氧化碳排放",4,"collocation","J2","policy",[c("CO₂ emissions","二氧化碳排放"),c("carbon emissions","碳排放"),c("greenhouse gas emissions","温室气体排放")],"emission常以复数emissions表示排放量。",[40]);
  add("meet governmental standards","达到政府标准",4,"phrase","J2","policy",[c("meet official requirements","达到官方要求"),c("comply with regulations","遵守规定"),c("meet the required standards","达到规定标准")],"meet在这里是达到、符合。",[40]);
  add("ambiguous future","不明确的未来；前景不明朗",4,"collocation","J4","policy",[c("uncertain future","不确定的未来"),c("unclear outlook","不明朗的前景")],"ambiguous强调含糊、不明确。",[40]);
  // ★★★ 熟练识别：熟词生义、句子结构与同义替换
  add("different pictures of temperature","不同的气温变化情况",3,"phrase","A4","climate",[c("different temperature patterns","不同的温度模式"),c("different warming trends","不同的升温趋势")],"picture在这里不是照片，而是情况、图景。",[27]);
  add("in the next century","在下个世纪",3,"phrase","A3","climate",[c("over the next 100 years","未来100年间"),c("in the coming century","在即将到来的世纪")],"century=100 years。",[27]);
  add("go up","上升；增加",3,"phrase","A3","climate",[c("rise","上升"),c("increase","增加"),c("climb","攀升")],"熟词短语，可描述价格、温度、数量。",[27]);
  add("polar region","极地地区",3,"collocation","A3","climate",[c("polar areas","极地地区"),c("polar zone","极地区域"),c("the Arctic and Antarctic","北极和南极地区")],"注意polar是极地的。",[27]);
  add("air conditioner","空调；空调设备",3,"word","A4","climate",[c("air conditioning","空调系统"),c("cooling system","冷却系统")],"原文用作比喻，说明海洋有调节温度的作用。",[27],"原文词汇","ˈeə kəndɪʃənə");
  add("temperature phenomenon","温度现象",3,"collocation","B1","research",[c("climate phenomenon","气候现象"),c("temperature pattern","温度模式")],"phenomenon的复数是phenomena。",[28]);
  add("scientifically speaking","从科学角度来说",3,"phrase","B1","research",[c("from a scientific perspective","从科学角度来看"),c("in scientific terms","从科学术语角度")],"适合引出科学解释。",[28]);
  add("originate from","起源于；源自",3,"phrase","B1","research",[c("stem from","源于"),c("derive from","源自"),c("come from","来自")],"与stem from高度近义。",[28]);
  add("refer to","指的是；涉及",3,"phrase","B1","research",[c("mean","意思是"),c("denote","表示"),c("describe","描述")],"refer to后面常接名词或名词短语。",[28]);
  add("recent work has revealed","近期研究揭示了",3,"phrase","B2","research",[c("recent research shows","近期研究表明"),c("studies have found","研究发现"),c("new findings reveal","新发现揭示")],"work在这里指研究成果，不是工作岗位。",[28]);
  add("including","包括",3,"word","B1","research",[c("such as","例如"),c("comprising","包括"),c("consisting of","由……组成")],"注意including后接被包含的项目。",[28],"原文词汇","ɪnˈkluːdɪŋ");
  add("moisture","水分；水汽",3,"word","B2","climate",[c("soil moisture","土壤水分"),c("moisture content","含水量"),c("moisture level","水分水平")],"根据语境可指土壤水分或空气水汽。",[28,29],"原文词汇","ˈmɔɪstʃə");
  add("more rainfall","更多降雨",3,"collocation","B2","climate",[c("increased rainfall","降雨量增加"),c("heavier precipitation","降水增多")],"rainfall通常作不可数名词。",[28]);
  add("before winter","冬季到来之前",3,"phrase","B3","climate",[c("prior to winter","在冬季之前"),c("before the onset of winter","冬季开始之前")],"before后接时间点或事件。",[28]);
  add("arrive too late to rescue","来得太晚，无法挽救",3,"phrase","B3","agriculture",[c("come too late to save","来得太晚，无法挽救"),c("be too late to prevent","为时已晚，无法阻止")],"too...to...表示太……而不能……。",[28]);
  add("measure","测量；衡量标准；措施",3,"word","C3","research",[c("measurement","测量结果"),c("indicator","指标"),c("take measures","采取措施")],"本篇measures指测量指标，不是措施。",[29],"原文词汇","ˈmeʒə");
  add("at their highest since","达到自……以来的最高水平",3,"phrase","C3","research",[c("reach the highest level since","达到自……以来的最高水平"),c("peak since","自……以来达到峰值")],"注意since后面接时间起点。",[29]);
  add("impose","施加；造成；强加",3,"word","C4","research",[c("impose pressure on","给……施加压力"),c("impose restrictions","施加限制"),c("inflict damage","造成损害")],"impose sth on sb/sth。",[29],"原文词汇","ɪmˈpəʊz");
  add("growth stage","生长阶段",3,"collocation","C4","agriculture",[c("developmental stage","发育阶段"),c("growth phase","生长时期")],"与crucial growth stage相关。",[29]);
  add("occur around","发生在……附近；发生于……时期",3,"phrase","C5","research",[c("happen during","发生在……期间"),c("take place at","发生于"),c("occur at a critical stage","发生在关键阶段")],"occur为正式的“发生”。",[29]);
  add("agriculture production","农业生产（原文不规范用法）",3,"collocation","D1","agriculture",[c("agricultural production","农业生产"),c("agricultural output","农业产出")],"规范表达为agricultural production。",[29],"原文词汇");
  add("due to","由于；因为",3,"phrase","D2","climate",[c("because of","因为"),c("owing to","由于"),c("as a result of","由于")],"后接名词或名词短语。",[30]);
  add("local skiing industry","当地滑雪产业",3,"collocation","D3","environment",[c("local ski industry","当地滑雪产业"),c("ski tourism","滑雪旅游业")],"local强调当地的。",[30]);
  add("snow at the bottom","山脚处的积雪；底部积雪",3,"phrase","D4","glacier",[c("snow at lower elevations","低海拔地区的积雪"),c("low-altitude snow","低海拔积雪")],"bottom在这里指山体较低处。",[30]);
  add("land covered by ice and snow","被冰雪覆盖的土地",3,"phrase","E2","glacier",[c("ice-covered land","被冰覆盖的土地"),c("snow-covered terrain","被雪覆盖的地形")],"过去分词短语covered by...作后置修饰。",[31]);
  add("involve","涉及；包含；需要",3,"word","E3","research",[c("involve a process","涉及一个过程"),c("entail","需要；牵涉"),c("include","包括")],"不只是“参与”，也可表示某事包含什么。",[31],"原文词汇","ɪnˈvɒlv");
  add("via","通过；经由",3,"prep","E4","research",[c("through","通过"),c("by means of","借助"),c("by way of","经由")],"正式书面语中常用于说明途径。",[31],"原文词汇","ˈvaɪə");
  add("altered","改变了的；发生变化的",3,"word","E4","research",[c("changed","改变的"),c("modified","修改的"),c("adjusted","调整过的")],"alter作动词表示改变。",[31],"原文词汇","ˈɔːltəd");
  add("finally","最终；最后",3,"word","E5","research",[c("eventually","最终"),c("ultimately","最终"),c("in the end","最后")],"在因果链中标记最终结果。",[31],"原文词汇","ˈfaɪnəli");
  add("signal","信号；迹象；指标",3,"word","E6","research",[c("a clear signal","明显信号"),c("an indicator of","……的指标"),c("evidence of","……的证据")],"熟词生义：不是交通信号，而是迹象、指标。",[31],"原文词汇","ˈsɪɡnəl");
  add("undoubtedly","毫无疑问地",3,"word","E6","research",[c("without doubt","毫无疑问"),c("certainly","当然"),c("clearly","显然")],"用于强调判断。",[31],"原文词汇","ʌnˈdaʊtɪdli");
  add("latest research result","最新研究成果",3,"collocation","F1","research",[c("latest findings","最新发现"),c("recent research results","近期研究结果"),c("new evidence","新证据")],"research result也可用finding替换。",[32]);
  add("further losses of ice","进一步的冰量损失",3,"collocation","F2","glacier",[c("additional ice loss","额外冰量损失"),c("continued glacial loss","持续冰川损失")],"further在这里表示额外的、进一步的。",[32]);
  add("sector","区域；部分；部门",3,"word","F3","research",[c("a sector of the glacier","冰川的一段区域"),c("business sector","商业部门"),c("a section of land","一块区域")],"本篇指冰川的一段区域，不是行业部门。",[32],"原文词汇","ˈsektə");
  add("melt down","融化；熔化",3,"phrase","F3","glacier",[c("melt","融化"),c("thaw","解冻"),c("ice melts away","冰逐渐融化")],"更常用的表达是melt；meltdown也可作名词表示熔毁。",[32]);
  add("at a rate of","以……的速度；按……的比率",3,"phrase","F4","research",[c("at a speed of","以……速度"),c("at a pace of","以……节奏"),c("at a rate of 40 metres per year","以每年40米的速度")],"后面接数值与单位。",[32]);
  add("rather","相当；颇为",3,"word","F4","research",[c("fairly","相当"),c("quite","相当"),c("relatively","相对地")],"rather可用于加强形容词语气。",[32],"原文词汇","ˈrɑːðə");
  add("continue to grow","持续增长；不断扩大",3,"phrase","F5","sea",[c("keep expanding","持续扩大"),c("continue to increase","持续增加"),c("grow steadily","稳步增长")],"可用于湖泊、人口、需求、市场。",[32]);
  add("direct result","直接结果",3,"collocation","G1","research",[c("immediate consequence","直接后果"),c("direct consequence","直接后果"),c("primary outcome","主要结果")],"direct强调直接的。",[33]);
  add("serve as","充当；作为",3,"phrase","G1","research",[c("act as","充当"),c("function as","发挥……作用"),c("constitute","构成")],"serve as + 名词。",[33]);
  add("main factor","主要因素",3,"collocation","G1","research",[c("key factor","关键因素"),c("primary cause","主要原因"),c("major contributor","主要促成因素")],"factor常与key、major、main搭配。",[33]);
  add("trend of sea level rise","海平面上升趋势",3,"collocation","G2","sea",[c("rising sea-level trend","海平面上升趋势"),c("upward trend in sea levels","海平面上升趋势")],"trend强调变化方向。",[33,34]);
  add("pose a possibility","带来……的可能性",3,"phrase","G2","research",[c("create the possibility of","产生……的可能性"),c("increase the likelihood of","增加……的可能性")],"原文搭配不够自然，常用pose a risk或create the possibility。",[34]);
  add("counter a trend","对抗某种趋势；遏制趋势",3,"phrase","G3","policy",[c("combat a trend","对抗趋势"),c("reverse a trend","扭转趋势"),c("address a trend","应对趋势")],"counter作动词表示抵制、对抗。",[35]);
  add("change in sea levels","海平面变化",3,"collocation","G3","sea",[c("changes in sea level","海平面变化"),c("sea-level fluctuations","海平面波动")],"注意sea level通常不加连字符也可作名词修饰。",[35]);
  add("emphasis on","对……的强调；重点关注",3,"collocation","H2","policy",[c("place emphasis on","强调"),c("focus on","关注"),c("give priority to","优先考虑")],"emphasis是名词，动词为emphasise。",[36,37]);
  add("conquer a tough period","克服困难时期（原文不自然表达）",3,"phrase","H2","policy",[c("overcome difficult times","克服困难时期"),c("get through a difficult period","渡过困难时期"),c("weather a crisis","挺过危机")],"conquer更常表示征服、战胜；此处更自然用overcome。",[36,37]);
  add("adjust","调整；适应",3,"word","H3","adaptation",[c("adjust to changes","适应变化"),c("adjust the settings","调整设置"),c("make adjustments","作出调整")],"adjust sth与adjust to sth结构不同。",[36],"原文词汇","əˈdʒʌst");
  add("in broad terms","总体而言；广义上来说",3,"phrase","H5","policy",[c("generally speaking","一般而言"),c("broadly speaking","总体而言"),c("in general","总的来说")],"常用于总结或概括。",[36,37]);
  add("going forward","今后；展望未来",3,"phrase","H5","policy",[c("in the future","未来"),c("from now on","从现在起"),c("in the years ahead","在未来几年")],"商务与学术语境中常用。",[36,37]);
  add("resilience","韧性；恢复能力",3,"word","H5","environment",[c("environmental resilience","环境韧性"),c("resilience to stress","应对压力的韧性"),c("build resilience","增强韧性")],"强调受到冲击后恢复或适应的能力。",[36,37],"原文词汇","rɪˈzɪliəns");
  add("realise","意识到；认识到；发现",3,"word","I2","research",[c("realise that","意识到"),c("recognise","认识到"),c("become aware of","意识到")],"英式拼写；美式为realize。",[38],"原文词汇","ˈrɪəlaɪz");
  add("a study has looked at","一项研究考察了",3,"phrase","I3","research",[c("a study examined","一项研究考察了"),c("research investigated","研究调查了"),c("a study focused on","一项研究聚焦于")],"look at在学术语境中可表示考察、研究。",[38]);
  add("according to","根据；按照",3,"phrase","I3","adaptation",[c("based on","基于"),c("in accordance with","按照"),c("depending on","取决于")],"根据某个标准或信息作判断。",[38]);
  add("try to find out","试图查明；尝试弄清楚",3,"phrase","I4","research",[c("investigate","调查"),c("determine","确定"),c("establish","查明")],"find out强调获得信息、弄清事实。",[38]);
  add("sex reversal","性别逆转",3,"collocation","I4","adaptation",[c("sex change","性别变化"),c("sex determination","性别决定"),c("temperature-dependent sex determination","温度依赖型性别决定")],"与sex determination并非完全相同概念。",[38],"原文词汇");
  add("in their growth","在它们的生长过程中",3,"phrase","I4","adaptation",[c("during development","在发育过程中"),c("throughout their growth","在整个生长过程中")],"growth表示生长、成长过程。",[38]);
  add("close relation","密切关系",3,"collocation","G1","research",[c("close connection","密切联系"),c("strong relationship","紧密关系"),c("be closely related to","与……密切相关")],"更自然常见的是a close relationship。",[33],"题干 / 选项");
  add("tackle the problems","处理这些问题；解决这些难题",3,"phrase","J1","environment",[c("address the problems","处理问题"),c("deal with the challenges","应对挑战"),c("resolve the issues","解决问题")],"tackle与problem、issue、challenge常搭配。",[40]);
  add("slow process","缓慢的过程",3,"collocation","J1","climate",[c("gradual process","渐进过程"),c("slow development","缓慢发展"),c("gradual change","逐渐变化")],"slow不等于停止或没有影响。",[39]);
  add("world issue","全球性问题",3,"collocation","J4","policy",[c("global issue","全球性问题"),c("worldwide challenge","全球挑战"),c("international concern","国际关注的问题")],"world issue可以理解，但global issue更自然。",[40]);
  add("so far","到目前为止",3,"phrase","J4","policy",[c("up to now","到目前为止"),c("thus far","迄今为止"),c("to date","截至目前")],"常与现在完成时连用。",[40]);
  add("hang in an ambiguous future","处于前景不明朗的状态（原文生硬表达）",3,"phrase","J4","policy",[c("remain uncertain","仍不确定"),c("have an unclear future","前景不明朗"),c("face an uncertain future","面临不确定的未来")],"更自然可说remain uncertain或have an uncertain future。",[40]);
  // ★★ 题干、选项与辅助理解
  add("main idea","主旨；中心思想",2,"collocation","A4","research",[c("central idea","中心思想"),c("main point","主要观点")],"常见题干表达。",[27],"题干 / 选项");
  add("one effect","一种影响",2,"collocation","B2","research",[c("one consequence","一种后果"),c("one impact","一种影响")],"effect是名词，affect是动词。",[28],"题干 / 选项");
  add("effect","影响；结果",2,"word","B2","research",[c("the effect of","……的影响"),c("have an effect on","对……产生影响")],"名词；与affect动词区分。",[28],"题干 / 选项","ɪˈfekt");
  add("affect","影响",2,"word","D1","climate",[c("affect agriculture","影响农业"),c("be affected by","受到……影响"),c("influence","影响")],"动词；与effect名词区分。",[29],"原文词汇","əˈfekt");
  add("close location","地理位置接近",2,"phrase","A4","climate",[c("proximity to","靠近……"),c("be geographically close to","地理位置靠近")],"close作形容词表示接近的。",[27],"题干 / 选项");
  add("air condition","空气状况（选项中的不规范表达）",2,"phrase","A4","climate",[c("air quality","空气质量"),c("air conditioning","空调系统")],"题目选项用法不自然；air quality才是空气质量。",[27],"题干 / 选项");
  add("maintain","保持；维持",2,"word","A2","policy",[c("maintain a trend","保持趋势"),c("maintain standards","维持标准"),c("sustain","维持")],"不只是维修，也可表示维持状态。",[27],"原文词汇","meɪnˈteɪn");
  add("high quality","高质量；高品质",2,"collocation","A4","policy",[c("high standard","高标准"),c("good quality","高品质")],"quality可指质量或品质。",[27],"题干 / 选项");
  add("hotter months","较热的月份",2,"collocation","B2","climate",[c("warmer months","较暖的月份"),c("summer months","夏季月份")],"比较级hotter。",[28],"题干 / 选项");
  add("soil water","土壤中的水分",2,"collocation","B2","agriculture",[c("soil moisture","土壤水分"),c("water content in soil","土壤含水量")],"soil water与soil moisture近义。",[28],"题干 / 选项");
  add("growing condition","生长条件",2,"collocation","C2","agriculture",[c("growing conditions","生长条件"),c("growth environment","生长环境")],"通常用复数growing conditions。",[29],"题干 / 选项");
  add("tough","艰难的；严峻的；困难的",2,"word","C2","policy",[c("tough conditions","艰苦条件"),c("challenging circumstances","具有挑战性的环境"),c("harsh conditions","恶劣条件")],"可形容环境、时期、问题。",[29],"题干 / 选项","tʌf");
  add("determine","确定；决定",2,"word","C2","research",[c("determine the cause","确定原因"),c("be determined by","由……决定"),c("identify","识别；确定")],"可表示通过研究查明，也可表示决定。",[29],"题干 / 选项","dɪˈtɜːmɪn");
  add("huge gap","巨大的差距",2,"collocation","C2","research",[c("a substantial gap","显著差距"),c("a considerable difference","相当大的差异")],"huge是口语化的large。",[29],"题干 / 选项");
  add("lowest production","最低产量",2,"collocation","C2","agriculture",[c("lowest output","最低产出"),c("minimum production level","最低生产水平")],"注意原文highest说的是水分亏缺指标，不是产量。",[29],"题干 / 选项");
  add("skiing station","滑雪场（选项用语）",2,"collocation","D3","environment",[c("ski resort","滑雪度假区"),c("ski area","滑雪区域")],"更自然通常说ski resort。",[30],"题干 / 选项");
  add("altitude","海拔；高度",2,"word","D3","glacier",[c("high altitude","高海拔"),c("altitude above sea level","海拔高度"),c("elevation","海拔")],"地理语境中指海拔。",[30],"题干 / 选项","ˈæltɪtjuːd");
  add("move to the north","向北移动",2,"phrase","D3","climate",[c("move northward","向北移动"),c("shift to the north","向北转移")],"move to the north是方向表达。",[30],"题干 / 选项");
  add("make a profit","盈利；赚取利润",2,"phrase","D3","policy",[c("earn a profit","赚取利润"),c("be profitable","有盈利"),c("generate revenue","产生收入")],"profit是利润，不等于收入revenue。",[30],"题干 / 选项");
  add("cumulative","累积的；累计的",2,"word","E4","research",[c("cumulative effect","累积效应"),c("cumulative total","累计总数"),c("accumulated","累积的")],"与accumulative近义，但cumulative更常见。",[31],"原文词汇","ˈkjuːmjələtɪv");
  add("alteration","改变；变化",2,"word","E4","research",[c("make alterations","作出修改"),c("structural alteration","结构变化"),c("modification","修改")],"alteration是alter的名词形式。",[31],"题干 / 选项","ˌɔːltəˈreɪʃn");
  add("faster changes","更快的变化",2,"collocation","E4","research",[c("more rapid changes","更迅速的变化"),c("accelerated changes","加速的变化")],"faster强调速度更快。",[31],"题干 / 选项");
  add("bigger length","更大的长度（选项中的不自然表达）",2,"phrase","E4","glacier",[c("greater length","更大的长度"),c("longer glaciers","更长的冰川")],"英语通常说greater length或longer。",[31],"题干 / 选项");
  add("mention","提及；提到",2,"word","F2","research",[c("mention an example","提到一个例子"),c("refer to","提及"),c("cite","引用")],"mention后可直接接名词。",[32],"题干 / 选项","ˈmenʃn");
  add("particular example","具体例子",2,"collocation","F2","research",[c("specific example","具体例子"),c("case study","案例研究")],"particular表示特定的、具体的。",[32],"题干 / 选项");
  add("emphasize","强调",2,"word","F2","research",[c("emphasize the importance of","强调……的重要性"),c("highlight","突出"),c("stress","强调")],"英式拼写emphasise。",[32],"题干 / 选项","ˈemfəsaɪz");
  add("severity","严重程度",2,"word","F2","environment",[c("the severity of drought","干旱的严重程度"),c("seriousness","严重性"),c("gravity","严重性")],"与severance拼写相似但含义不同。",[32],"题干 / 选项","sɪˈverəti");
  add("alarm","使警觉；使担忧",2,"word","F2","environment",[c("raise the alarm","发出警报"),c("alert the public","提醒公众"),c("cause concern","引起担忧")],"alarm既可作名词也可作动词。",[32],"题干 / 选项","əˈlɑːm");
  add("melting speed","融化速度",2,"collocation","F2","glacier",[c("rate of melting","融化速率"),c("melting rate","融化速度")],"学术表达通常用rate of melting。",[32],"题干 / 选项");
  add("disappear","消失",2,"word","F2","glacier",[c("vanish","消失"),c("cease to exist","不复存在"),c("disappear completely","完全消失")],"注意F5原文说湖继续扩大，并未说消失。",[32],"题干 / 选项","ˌdɪsəˈpɪə");
  add("reach","到达；达到",2,"word","F5","research",[c("reach a point","到达某一点"),c("reach a level","达到某一水平"),c("attain","达到")],"可表示空间到达，也可表示数值达到。",[32],"原文词汇","riːtʃ");
  add("connected with","与……有关；与……相联系",2,"phrase","G1","research",[c("related to","与……有关"),c("associated with","与……相关"),c("linked to","与……相联系")],"connected with常用于关系描述。",[33],"题干 / 选项");
  add("increase in sea level","海平面上升",2,"collocation","G1","sea",[c("sea-level rise","海平面上升"),c("rising sea levels","海平面上升")],"与sea level rise同义。",[33],"题干 / 选项");
  add("underground water system","地下水系统",2,"collocation","G2","sea",[c("groundwater system","地下水系统"),c("underground water resources","地下水资源")],"groundwater是更常见的合写形式。",[34],"题干 / 选项");
  add("destruction","破坏；毁坏",2,"word","G2","environment",[c("environmental destruction","环境破坏"),c("cause damage","造成损害"),c("devastation","严重破坏")],"destruction语气通常比damage更强。",[34],"题干 / 选项","dɪˈstrʌkʃn");
  add("high probability","很高的可能性",2,"collocation","G2","research",[c("strong likelihood","很大的可能性"),c("great possibility","很大的可能性")],"probability通常用于正式、学术语境。",[34],"题干 / 选项");
  add("improve","改善；提高；改进",2,"word","G3","policy",[c("improve conditions","改善条件"),c("improve infrastructure","改善基础设施"),c("enhance","提升")],"本题与upgraded对应。",[35],"题干 / 选项","ɪmˈpruːv");
  add("less responsive to","对……反应较迟缓；不如……积极",2,"phrase","H3","research",[c("react less to","对……反应较少"),c("be less sensitive to","对……不太敏感"),c("respond less actively to","对……回应不够积极")],"比较结构less...than。",[36],"题干 / 选项");
  add("conservative","保守的；传统的",2,"word","H4","policy",[c("conservative approach","保守的做法"),c("traditional practices","传统做法"),c("resistant to change","抗拒改变")],"题干对农业部门作出评价，原文并未给出该评价。",[37],"题干 / 选项","kənˈsɜːvətɪv");
  add("agricultural sector","农业部门；农业领域",2,"collocation","H4","agriculture",[c("farming sector","农业部门"),c("agricultural industry","农业产业")],"sector表示经济或社会中的一个部门。",[37],"题干 / 选项");
  add("deal with","处理；应对",2,"phrase","H4","policy",[c("deal with climate change","应对气候变化"),c("handle a problem","处理问题"),c("cope with difficulties","应对困难")],"deal with后接问题、任务或人。",[37],"题干 / 选项");
  add("agree with","同意；与……一致",2,"phrase","H3","research",[c("agree with a statement","同意一个陈述"),c("be consistent with","与……一致"),c("correspond to","与……相符")],"判断题题干常见指令。",[36,37,38,39,40],"题干 / 选项");
  add("claim","主张；观点；声称",2,"word","H3","research",[c("make a claim","提出主张"),c("the writer's claim","作者的观点"),c("assertion","断言")],"claim可作名词或动词。",[36,37,38,39,40],"题干 / 选项","kleɪm");
  add("statement","陈述；说法",2,"word","H3","research",[c("a clear statement","明确陈述"),c("statement of fact","事实陈述"),c("assertion","断言")],"判断题instructions中的常见词。",[36,37,38,39,40],"题干 / 选项","ˈsteɪtmənt");
  add("emission","排放；排放物",2,"word","J2","policy",[c("carbon emissions","碳排放"),c("gas emissions","气体排放"),c("emission levels","排放水平")],"常用复数emissions。",[40],"原文词汇","ɪˈmɪʃn");
  add("must","必须；一定",2,"modal verb","J2","policy",[c("have to","必须"),c("be required to","被要求"),c("need to","需要")],"情态动词must表达强制性或必要性。",[40],"题干 / 选项");
  add("cut emissions","削减排放量",2,"phrase","J2","policy",[c("reduce emissions","减少排放"),c("lower carbon emissions","降低碳排放"),c("emission reduction","减排")],"cut在这里表示削减。",[40],"题干 / 选项");
  add("solve the problem","解决问题",2,"phrase","J2","policy",[c("address the problem","处理问题"),c("resolve the issue","解决问题"),c("find a solution","找到解决方案")],"solve强调问题得到解决。",[40],"题干 / 选项");
  add("different effects","不同的影响",2,"collocation","J1","climate",[c("different impacts","不同影响"),c("varying effects","各不相同的影响")],"与different impact同义。",[39],"题干 / 选项");
  add("northern","北部的；北方的",2,"word","I3","climate",[c("northern region","北部地区"),c("in the north","在北部")],"方向形容词。",[38],"原文词汇","ˈnɔːðən");
  add("latest","最新的",2,"word","F1","research",[c("the latest findings","最新发现"),c("most recent","最近的"),c("newest","最新的")],"latest常修饰research、news、technology。",[32],"原文词汇","ˈleɪtɪst");
  add("further","进一步的；此外",2,"word","F2","research",[c("further research","进一步研究"),c("additional losses","额外损失"),c("more information","更多信息")],"further可作形容词或副词。",[32],"原文词汇","ˈfɜːðə");
  add("several","几个；数个",2,"word","E4","research",[c("several decades","数十年"),c("several factors","几个因素"),c("a number of","若干")],"several通常表示数量不多的多个。",[31],"原文词汇","ˈsevrəl");
  add("major factor","主要因素",2,"collocation","G1","research",[c("key factor","关键因素"),c("primary cause","主要原因"),c("main contributor","主要促成因素")],"major表示主要的、重要的。",[33]);
  add("rather than","而不是；而非",2,"phrase","C5","research",[c("instead of","而不是"),c("as opposed to","与……相对"),c("in place of","代替")],"连接两个并列成分。",[29]);
  // ★ 专题补充与专有名词
  add("South Polar Region","南极地区",1,"proper","A2","climate",[c("Antarctic region","南极地区"),c("the South Pole","南极点")],"专有地理名称；通常说Antarctic region。",[],"专有名词");
  add("Antarctica","南极洲",1,"proper","B1","climate",[c("Antarctic continent","南极大陆"),c("Antarctic region","南极地区")],"与Arctic（北极地区）区分。",[],"专有名词","ænˈtɑːktɪkə");
  add("National Institute of Water and Atmospheric Research (NIWA)","新西兰国家水与大气研究所",1,"proper","F1","research",[c("climate research institute","气候研究机构"),c("atmospheric research","大气研究")],"新西兰国家研究机构缩写。",[],"专有名词");
  add("Mt. Cook Region","库克山地区",1,"proper","F2","glacier",[c("Mount Cook area","库克山区域"),c("Southern Alps","南阿尔卑斯山脉")],"新西兰南岛著名山地区域。",[],"专有名词");
  add("Hooker Lake","胡克湖",1,"proper","F3","glacier",[c("glacial lake","冰川湖"),c("meltwater lake","融水湖")],"由冰川融水形成的湖泊名称。",[],"专有名词");
  add("14 km long","长达14公里",1,"measurement","F3","research",[c("14 kilometres in length","长度为14公里"),c("a 14-kilometre section","一段14公里长的区域")],"长度表达；数字与单位之间留空格。",[],"数值表达");
  add("40 m/yr","每年40米",1,"measurement","F4","research",[c("40 metres per year","每年40米"),c("at a rate of 40 m a year","以每年40米的速度")],"yr是year的缩写。",[],"数值表达");
  add("0.5%","百分之零点五",1,"measurement","J2","policy",[c("account for 0.5%","占0.5%"),c("half a percent","百分之零点五")],"比例表达；注意of the world's total。",[],"数值表达");
  add("sex determination","性别决定",1,"collocation","I5","adaptation",[c("temperature-dependent sex determination","温度依赖型性别决定"),c("sex ratio","性别比例")],"与sex reversal相关，但并非完全相同概念。",[38],"专题补充");
  return {
    version:1,date:"2026-11-11",
    materials:[{id:"global-warming",en:"Global Warming in New Zealand",zh:"新西兰的全球变暖",count:cards.length}],
    cards,sources,exampleGroups,
    sections:[
      {id:"A",title:"气温变化与海洋调节",summary:"新西兰气温持续上升，但周围海洋发挥调节作用，使升温幅度相对较小。"},
      {id:"B",title:"SAM风带与农业干旱",summary:"SAM变化导致夏季水汽减弱、其他季节降雨增加；土壤水分流失加剧，农业干旱风险上升。"},
      {id:"C",title:"水分亏缺与谷物产量",summary:"水分亏缺是植物需求水量与土地供水量之间的差距；发生在关键生长阶段时，谷物产量可能明显下降。"},
      {id:"D",title:"积雪、雪线与滑雪产业",summary:"雪线上移会使低处积雪更早融化，但部分地区降雪量增加，可能帮助滑雪产业渡过困难时期。"},
      {id:"E",title:"冰川变化的科学机制",summary:"质量平衡的累积变化影响冰川体积、厚度、冰体流动和冰川舌的前进或后退。"},
      {id:"F",title:"库克山与胡克湖案例",summary:"NIWA研究以库克山地区为例，说明冰川融化、后退以及融水湖扩大的过程。"},
      {id:"G",title:"海平面、地下水与农业",summary:"海平面变化可能威胁地下水系统，并通过盐度问题进一步影响农业生产；海岸边界需要重新评估。"},
      {id:"H",title:"人类的适应与应对",summary:"农民调整品种，农学家处理土壤问题；长期策略与生态系统韧性共同发挥作用。"},
      {id:"I",title:"动物的适应机制",summary:"海龟的性别受到巢穴温度影响，展示了动物对环境变化的特殊适应机制。"},
      {id:"J",title:"全球问题与共同责任",summary:"新西兰排放占比有限，单个国家的努力只是冰山一角；全球变暖需要更广泛的国际协作。"}
    ],
    pairs:[
      {a:"stem from",b:"originate from / arise from",zh:"源于；起因于",q:"27–28",note:"都用于追溯原因。"},
      {a:"result in",b:"lead to / cause / bring about",zh:"导致；造成",q:"28–29",note:"注意后面接结果，而不是原因。"},
      {a:"weakening of moisture",b:"reduced moisture / decreased moisture",zh:"水汽减弱；水分减少",q:"28",note:"对应夏季水汽减少。"},
      {a:"more rainfall",b:"increased precipitation",zh:"降雨量增加",q:"28",note:"rainfall与precipitation都可指降水。"},
      {a:"at an alarming rate",b:"rapidly / at a worrying rate",zh:"以惊人的速度",q:"30",note:"alarming带有令人担忧的语气。"},
      {a:"tide over tough periods",b:"get through difficult times / weather a crisis",zh:"渡过困难时期",q:"30",note:"tide over常与困难、危机搭配。"},
      {a:"cumulative changes",b:"accumulated changes",zh:"累积变化",q:"31",note:"强调多个变化逐渐叠加。"},
      {a:"volume and thickness changes",b:"alterations in volume and thickness",zh:"体积和厚度变化",q:"31",note:"这是第31题的直接答案依据。"},
      {a:"glacier retreat",b:"glacier recession / glaciers move backwards",zh:"冰川后退",q:"31–32",note:"retreat也可表示撤退。"},
      {a:"pose a threat to",b:"threaten / put ... at risk / endanger",zh:"对……构成威胁",q:"34",note:"注意pose在此处表示构成。"},
      {a:"groundwater system",b:"underground water system",zh:"地下水系统",q:"34",note:"groundwater是更常见的合写形式。"},
      {a:"upgraded",b:"improved / enhanced",zh:"升级；改善",q:"35",note:"与摘要填空中的improve对应。"},
      {a:"redefined",b:"defined again / revised",zh:"重新界定；重新定义",q:"35",note:"与coastal boundaries组成正确答案。"},
      {a:"different impact",b:"different effects / varying effects",zh:"不同影响",q:"39",note:"impact与effect在这里都是名词。"},
      {a:"various regions",b:"different areas / multiple regions",zh:"不同地区",q:"39",note:"various强调多个不同的。"},
      {a:"account for",b:"make up / constitute / represent",zh:"占据；占……比例",q:"40",note:"本篇指占全球排放总量的比例。"},
      {a:"unconventional adaptation",b:"unusual adaptation / adaptive response",zh:"不同寻常的适应方式",q:"38",note:"文章用海龟作为动物适应的例子。"},
      {a:"play a vital role",b:"be crucial to / be essential for",zh:"发挥至关重要的作用",q:"38",note:"vital与crucial语义接近。"},
      {a:"in the long run",b:"over the long term / from a long-term perspective",zh:"从长远来看",q:"35",note:"常用于写作中引出长期影响。"},
      {a:"records show",b:"data indicate / evidence suggests",zh:"记录表明；数据表明",q:"39",note:"学术文章常见证据引出表达。"},
      {a:"a tip of the iceberg",b:"only a small part of a much larger issue",zh:"冰山一角；整体中很小的一部分",q:"40",note:"强调单个国家努力的局限。"},
      {a:"diminish",b:"reduce / lessen / mitigate",zh:"减少；减轻",q:"35",note:"常与effect、impact、risk搭配。"},
      {a:"vulnerable to",b:"susceptible to / at risk from",zh:"容易受到……伤害或影响",q:"38",note:"注意vulnerable强调易受伤害。"},
      {a:"as opposed to",b:"in contrast to / rather than",zh:"与……相对；而不是",q:"29",note:"用于比较不同阶段的影响。"},
      {a:"meet governmental standards",b:"comply with official requirements",zh:"达到政府标准；符合官方要求",q:"40",note:"meet在这里表示达到标准。"},
      {a:"more likely to",b:"have a greater likelihood of / be more probable to",zh:"更有可能",q:"30",note:"表示概率较高，不代表必然发生。"}
    ],
    questions:[
      {no:27,type:"mc",en:"What is the main idea of the first paragraph?",zh:"第一段的主旨是什么？",options:[["A","The temperature in the polar region will increase less than that in New Zealand in the next century."],["B","The weather and climate of New Zealand is very important to its people because of its close location to the polar region."],["C","The air condition in New Zealand will maintain a high quality because of the ocean."],["D","The temperature of New Zealand will increase less than that of other regions in the next 100 years because it is surrounded by sea."]],answer:"D",chosen:"D",wrong:false,evidence:["A3","A4"],chunks:[["in the next century","在下个世纪"],["stem from its surrounding ocean","源于周围海洋"],["acts like the air conditioner","发挥类似空调的调节作用"]],mapping:"in the next 100 years = in the next century；surrounded by sea = surrounding ocean；升温较少的原因是海洋调节。",note:"A把升温幅度说反；B没有提到；C把海洋调节温度曲解成空气质量。",explanation:"A段指出新西兰下个世纪升温约4℃，极地升温超过6℃，差异源于周围海洋的调节作用。D同时概括了升温较少和海洋原因。"},
      {no:28,type:"mc",en:"What is one effect of the wind belt that circles the Southern Oceans?",zh:"环绕南大洋的风带会产生什么影响？",options:[["A","New Zealand will have more moisture in winds in summer."],["B","New Zealand needs to face droughts more often in hotter months in a year."],["C","Soil water will increase as a result of weakening moisture in the winds."],["D","Agricultural production will be reduced as a result of more rainfall in other seasons."]],answer:"B",chosen:"B",wrong:false,evidence:["B1","B2","B3"],chunks:[["a weakening of moisture during the summer","夏季水汽减弱"],["heavier droughts","更严重的干旱"],["more water loss from soil","更多土壤水分流失"]],mapping:"weakening of moisture = less moisture；heavier droughts = more severe droughts。",note:"A与水汽减弱相反；C与土壤失水增加相反；D把减产原因错误归结为其他季节降雨增加。",explanation:"SAM变化导致夏季水汽减弱，土壤水分流失加剧，农业面临更严重的干旱，因此B正确。"},
      {no:29,type:"mc",en:"What does “moisture deficit” mean to the grain and crops?",zh:"水分亏缺对谷物和农作物意味着什么？",options:[["A","The growing condition will be very tough for crops."],["B","The growing season of some plants can hardly be determined."],["C","There will be a huge gap between the water plants needed and the water the earth can offer."],["D","The soil of grain and crops in New Zealand reached its lowest production since 1970s."]],answer:"A",chosen:"C",wrong:true,evidence:["C1","C2","C5"],chunks:[["the gap between the water plants need and the water the earth can offer","植物所需水量与土地可供水量之间的差距"],["a crucial growth stage","关键生长阶段"],["22% reduction in grain yield","谷物产量减少22%"]],mapping:"C是moisture deficit的定义；题目问mean to the grain and crops，重点是对作物的影响，C5说明关键生长期水分亏缺会造成减产。",note:"你的误区：找到定义后直接选定义，没有继续判断题目问的是定义还是影响。D把水分亏缺指标最高误读成作物产量最低。",explanation:"题目问水分亏缺对作物意味着什么，而不是水分亏缺的定义。关键生长期发生水分亏缺会造成谷物减产，因此A概括了其负面影响。"},
      {no:30,type:"mc",en:"What changes will happen to skiing industry due to the global warming phenomenon?",zh:"全球变暖会给滑雪产业带来什么变化？",options:[["A","The skiing station may lower the altitude of skiing."],["B","Part of the skiing station needs to move to the north."],["C","The snowfall may increase in part of the skiing station."],["D","The local skiing station may likely to make a profit because of the snowfall increase."]],answer:"C",chosen:"C",wrong:false,evidence:["D3","D4","D5"],chunks:[["the snow line may move up","雪线可能上移"],["snow at the bottom will melt earlier","山脚处的积雪会更早融化"],["quantities of snowfall ... increase","降雪量增加"]],mapping:"the quantities of snowfall ... increase = snowfall may increase；in some areas = in part of the skiing region。",note:"D把渡过困难时期扩大成盈利；A与雪线上移的趋势不符；B原文没有提及。",explanation:"雪线上移会给滑雪业带来困难，但部分地区降雪量可能增加，有助于产业渡过困难时期。C是准确概括。"},
      {no:31,type:"mc",en:"Cumulative changes over a long period of time in mass balance will lead to...",zh:"长期以来质量平衡的累积变化会导致什么？",options:[["A","alterations in the volume and thickness of glaciers."],["B","faster changes in internal deformation and basal sliding."],["C","bigger length of glaciers."],["D","retreat of glacier tongues as a result of change in annual atmospheric conditions."]],answer:"A",chosen:"D",wrong:true,evidence:["E4","E5","E6"],chunks:[["cumulative changes in mass balance","质量平衡的累积变化"],["cause volume and thickness changes","导致体积和厚度变化"],["affect the flow of ice via...","通过……影响冰体流动"],["finally leads to glacier length changes","最终导致冰川长度变化"]],mapping:"cumulative changes → volume and thickness changes 是直接因果；冰体流动和冰川舌后退属于后续环节。",note:"你的误区：将段落中出现的glacier tongues retreat与annual atmospheric conditions拼接成因果关系。D改变了原文逻辑。",explanation:"E段明确说明质量平衡的累积变化首先导致冰川体积和厚度变化，因此A正确。冰体流动、冰川长度变化和冰舌后退是后续过程。"},
      {no:32,type:"mc",en:"Why does the writer mention NIWA in the sixth paragraph?",zh:"作者为什么在第六段提到NIWA？",options:[["A","To use a particular example to explain the effects brought by glacier melting."],["B","To emphasize the severity of the further loss of ice in Mt. Cook Region."],["C","To alarm the reader of melting speed of glaciers at a uniform rate."],["D","To note the lake in the region will disappear when it reaches the glacier bed."]],answer:"A",chosen:"A",wrong:false,evidence:["F1","F2","F3","F4","F5"],chunks:[["latest research result","最新研究成果"],["a 14 km long sector","一段长达14公里的区域"],["melt lake","融水湖"],["retreat at a uniform rate","以均匀速度后退"]],mapping:"NIWA研究 + Mt. Cook Region + Hooker Lake构成具体案例，用于解释冰川融化的影响。",note:"C把均匀后退速度误读为融化速度；D与湖泊持续扩大直至冰川底部相反。",explanation:"NIWA的研究以库克山地区和胡克湖为例，具体说明冰川融化、后退及湖泊扩大的影响，因此A正确。"},
      {no:33,type:"fill",en:"The major reason for the increase in sea level is connected with ______.",zh:"海平面上升的主要原因与什么有关？",answer:"high tides",accepted:["high tides"],chosen:"high tides",wrong:false,evidence:["G1"],chunks:[["the change of high tides","高潮位的变化"],["the main factor for sea level rise","海平面上升的主要因素"]],mapping:"the major reason = the main factor；connected with = 对应、与……有关。",note:"答案必须从原文提取，且不超过两个词。",explanation:"G段给出的原文词组是high tides，恰好符合不超过两个词的要求。"},
      {no:34,type:"fill",en:"The increase in sea level may lead to a reduction in ______.",zh:"海平面上升可能导致什么减少？",answer:"agricultural production",accepted:["agricultural production"],chosen:"agricultural production",wrong:false,evidence:["G2"],chunks:[["pose a possibility to decrease","带来……下降的可能性"],["a reduction in","……方面的减少"]],mapping:"pose a possibility to decrease = may lead to a reduction in。",note:"答案两个词，完整保留原文名词短语。",explanation:"G段明确提到海平面上升可能导致agricultural production下降。"},
      {no:35,type:"fill",en:"In the long run, New Zealanders may have to improve the ______ if they want to diminish the effect of changes in sea levels.",zh:"从长远来看，如果想减轻海平面变化的影响，新西兰人可能需要改善什么？",answer:"coastal boundaries",accepted:["coastal boundaries"],chosen:"trend",wrong:true,evidence:["G3","G4"],chunks:[["a longer-term view","更长远的视角"],["the coastal boundaries need to be upgraded and redefined","海岸边界需要升级并重新界定"]],mapping:"in the long run = a longer-term view；improve = upgraded and redefined。",note:"你的答案trend来自前一句the trend of sea level rise，但题目问improve什么；真正需要升级和重新界定的是coastal boundaries。",explanation:"答案为coastal boundaries。题干的improve对应原文upgraded and redefined，定位在G段最后一句。"},
      {no:36,type:"ynng",en:"Farmers are less responsive to climate change than agriculturists.",zh:"农民对气候变化的反应不如农学家积极。",options:[["YES","YES"],["NO","NO"],["NOT GIVEN","NOT GIVEN"]],answer:"NOT GIVEN",chosen:"NOT GIVEN",wrong:false,evidence:["H3","H4"],chunks:[["farmers are taking a long-term approach","农民采取长期策略"],["agriculturists also find ways","农学家也在寻找方法"]],mapping:"原文分别描述两类人的行动，但没有比较谁反应更积极。",note:"不能根据作者分别提及两种行动就推断谁更积极。",explanation:"文章只介绍农民与农学家的应对方式，没有对两者的响应程度进行比较，因此NOT GIVEN。"},
      {no:37,type:"ynng",en:"The agricultural sector is too conservative in dealing with climate change.",zh:"农业部门在应对气候变化时过于保守。",options:[["YES","YES"],["NO","NO"],["NOT GIVEN","NOT GIVEN"]],answer:"NOT GIVEN",chosen:"YES",wrong:true,evidence:["H3","H4"],chunks:[["long-term, multi-generational approach","长期、跨世代的方法"],["find ways to tackle the problems","寻找解决问题的方法"]],mapping:"conservative（保守）是题干新增评价，原文没有对农业部门作出这种评价。",note:"你的答案YES属于过度推断。长期策略不等于保守，原文没有评价农业部门是否保守。",explanation:"H段只说明农民调整品种、农学家解决土壤问题，没有提到农业部门是否过于保守，因此NOT GIVEN。"},
      {no:38,type:"ynng",en:"Turtles are vulnerable to climate change.",zh:"海龟容易受到气候变化的伤害。",options:[["YES","YES"],["NO","NO"],["NOT GIVEN","NOT GIVEN"]],answer:"NO",chosen:"YES",wrong:true,evidence:["I2","I3","I5"],chunks:[["unconventional adaptation","不同寻常的适应方式"],["according to the temperature","根据温度"],["the temperature of the nest plays a vital role","巢穴温度发挥重要作用"]],mapping:"题干vulnerable强调易受伤害；原文把海龟作为具有特殊适应机制的例子。",note:"注意：adaptation不等于完全不受影响。本题按文章对动物适应机制的正面呈现判NO，不要扩大成海龟完全不会受到气候变化影响。",explanation:"原文强调动物具有不同寻常的适应方式，并以海龟为例说明温度影响性别决定。命题意图将其与vulnerable的易受伤害含义对照，因此答案NO。"},
      {no:39,type:"ynng",en:"Global warming is progressing slowly and may have different effects on different areas in New Zealand.",zh:"全球变暖进程缓慢，并且可能对新西兰不同地区产生不同影响。",options:[["YES","YES"],["NO","NO"],["NOT GIVEN","NOT GIVEN"]],answer:"YES",chosen:"NO",wrong:true,evidence:["J1"],chunks:[["the slow process of global warming","全球变暖的缓慢进程"],["a different impact on various regions","对不同地区产生不同影响"]],mapping:"slow process = progressing slowly；different impact = different effects；various regions = different areas。",note:"你的答案NO忽略了直接同义替换。slow不等于stop，may也不是否定。",explanation:"题干几乎逐项改写J段原句，三组同义替换完全对应，因此YES。"},
      {no:40,type:"ynng",en:"New Zealand must cut carbon dioxide emissions if it wants to solve the problem of global warming.",zh:"如果新西兰想解决全球变暖问题，就必须削减二氧化碳排放。",options:[["YES","YES"],["NO","NO"],["NOT GIVEN","NOT GIVEN"]],answer:"NO",chosen:"NOT GIVEN",wrong:true,evidence:["J2","J3","J4"],chunks:[["accounts for 0.5% of the world's total","占全球总量的0.5%"],["has met the governmental standard","已经达到政府标准"],["only a tip of the iceberg","只是冰山一角"]],mapping:"原文强调新西兰排放占比有限、已达到政府标准，而且全球变暖是世界性问题；命题意图否定将解决全球问题的责任单独归于新西兰。",note:"你的答案NOT GIVEN忽略了文章对排放比例、政府标准和全球共同责任的明确讨论。注意NO不等于新西兰完全不需要减排。",explanation:"按本题标准答案，作者强调单个国家的努力不足以解决全球问题，不能将新西兰进一步减排说成解决全球变暖的必要条件。题目答案为NO；但原文并未主张新西兰不应继续减排。"}
    ]
  };
})();